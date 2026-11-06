[CmdletBinding()]
param(
    [switch]$SkipDatabase,
    [switch]$Stop,
    [switch]$StopDatabases,
    [ValidateRange(30, 600)]
    [int]$StartupTimeoutSeconds = 150
)

$ErrorActionPreference = 'Stop'

$backendRoot = $PSScriptRoot
$composeFile = Join-Path $backendRoot '..\compose.yaml'
$runtimeRoot = Join-Path $env:TEMP 'MediReservasApp-backend'
$logRoot = Join-Path $runtimeRoot 'logs'
$stateFile = Join-Path $runtimeRoot 'processes.json'
$null = New-Item -ItemType Directory -Path $logRoot -Force

$script:StartedProcesses = New-Object System.Collections.ArrayList
$script:ServiceDefinitions = @{
    auth           = @{ Name = 'auth-service';           Port = 9001 }
    users          = @{ Name = 'users-service';          Port = 9002 }
    doctors        = @{ Name = 'doctors-service';        Port = 9003 }
    appointments   = @{ Name = 'appointments-service';   Port = 9006 }
    'medical-records' = @{ Name = 'medical-records-service'; Port = 9008 }
    eureka         = @{ Name = 'eureka';                 Port = 8761 }
    gateway        = @{ Name = 'gateway';                Port = 9013 }
}

$databaseContainers = @('mysql_medireservas_db')

function Test-TcpPort {
    param([int]$Port)

    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $client.Connect('127.0.0.1', $Port)
        return $client.Connected
    }
    catch {
        return $false
    }
    finally {
        $client.Close()
    }
}

function Wait-ForTcpPort {
    param(
        [int]$Port,
        [string]$Description,
        [System.Diagnostics.Process]$Process,
        [int]$TimeoutSeconds = $StartupTimeoutSeconds
    )

    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    while ([DateTime]::UtcNow -lt $deadline) {
        if ($null -ne $Process -and $Process.HasExited) {
            throw "$Description terminó antes de abrir el puerto $Port. Revisa los logs en $logRoot."
        }
        if (Test-TcpPort -Port $Port) {
            return
        }
        Start-Sleep -Seconds 2
    }
    throw "Tiempo agotado esperando $Description en el puerto $Port. Revisa los logs en $logRoot."
}

function Save-ProcessState {
    $state = @(
        foreach ($item in $script:StartedProcesses) {
            [pscustomobject]@{
                Pid       = $item.Process.Id
                Module    = $item.Module
                Name      = $item.Name
                StdOut    = $item.StdOut
                StdErr    = $item.StdErr
            }
        }
    )
    $state | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $stateFile -Encoding UTF8
}

function Stop-ManagedProcesses {
    if (-not (Test-Path -LiteralPath $stateFile)) {
        Write-Host 'No hay procesos Spring registrados para detener.'
        return
    }

    $entries = @(Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json)
    foreach ($entry in $entries) {
        $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $($entry.Pid)" -ErrorAction SilentlyContinue
        if ($null -eq $processInfo) {
            continue
        }
        if ($processInfo.CommandLine -notmatch 'mvn\s+spring-boot:run') {
            Write-Warning "Se omitió PID $($entry.Pid): ya no parece ser el proceso Maven iniciado por este script."
            continue
        }

        Write-Host "Deteniendo $($entry.Module) (PID $($entry.Pid))..."
        & taskkill.exe /PID $entry.Pid /T /F | Out-Null
    }

    Remove-Item -LiteralPath $stateFile -Force -ErrorAction SilentlyContinue
}

function Start-ManagedService {
    param([string]$Module)

    $definition = $script:ServiceDefinitions[$Module]
    $modulePath = Join-Path $backendRoot $Module
    if (-not (Test-Path (Join-Path $modulePath 'pom.xml'))) {
        throw "No se encontró pom.xml para el módulo '$Module' en $modulePath."
    }
    if (Test-TcpPort -Port $definition.Port) {
        throw "El puerto $($definition.Port) de $Module ya está ocupado. Detén el proceso que lo usa o ajusta su configuración."
    }

    $stdout = Join-Path $logRoot "$Module.out.log"
    $stderr = Join-Path $logRoot "$Module.err.log"
    Remove-Item -LiteralPath $stdout, $stderr -Force -ErrorAction SilentlyContinue

    Write-Host "Iniciando $Module en el puerto $($definition.Port)..."
    $process = Start-Process `
        -FilePath $env:ComSpec `
        -ArgumentList @('/d', '/c', 'mvn spring-boot:run') `
        -WorkingDirectory $modulePath `
        -RedirectStandardOutput $stdout `
        -RedirectStandardError $stderr `
        -WindowStyle Hidden `
        -PassThru

    $item = [pscustomobject]@{
        Process = $process
        Module  = $Module
        Name    = $definition.Name
        Port    = $definition.Port
        StdOut  = $stdout
        StdErr  = $stderr
    }
    $null = $script:StartedProcesses.Add($item)
    Save-ProcessState
    return $item
}

function Wait-ForEurekaRegistration {
    param([pscustomobject]$Service)

    $appName = $Service.Name.ToUpperInvariant()
    $uri = "http://localhost:8761/eureka/apps/$appName"
    $deadline = [DateTime]::UtcNow.AddSeconds($StartupTimeoutSeconds)

    while ([DateTime]::UtcNow -lt $deadline) {
        try {
            $response = Invoke-WebRequest `
                -Uri $uri `
                -Headers @{ Accept = 'application/json' } `
                -TimeoutSec 3 `
                -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                return
            }
        }
        catch {
            # Eureka aún no conoce el servicio; seguir esperando.
        }
        Start-Sleep -Seconds 2
    }
    throw "El servicio $($Service.Name) abrió su puerto, pero no apareció registrado en Eureka."
}

function Start-ServiceGroup {
    param([string[]]$Modules)

    $started = @()
    foreach ($module in $Modules) {
        $started += Start-ManagedService -Module $module
    }
    foreach ($service in $started) {
        Wait-ForTcpPort `
            -Port $service.Port `
            -Description $service.Module `
            -Process $service.Process
    }
    foreach ($service in $started) {
        Wait-ForEurekaRegistration -Service $service
        Write-Host "$($service.Module) listo y registrado en Eureka."
    }
}

function Wait-ForDatabases {
    $deadline = [DateTime]::UtcNow.AddSeconds($StartupTimeoutSeconds)
    while ([DateTime]::UtcNow -lt $deadline) {
        $allHealthy = $true
        foreach ($container in $databaseContainers) {
            $health = & docker inspect --format '{{.State.Health.Status}}' $container 2>$null
            if ($LASTEXITCODE -ne 0) {
                throw "No se encontró el contenedor esperado '$container'."
            }
            if ($health.Trim() -eq 'unhealthy') {
                throw "La base '$container' quedó en estado unhealthy."
            }
            if ($health.Trim() -ne 'healthy') {
                $allHealthy = $false
            }
        }
        if ($allHealthy) {
            Write-Host 'La instancia MySQL compartida está saludable.'
            return
        }
        Start-Sleep -Seconds 3
    }
    throw "Tiempo agotado esperando que las bases de datos estén saludables."
}

if ($Stop) {
    Stop-ManagedProcesses
    if ($StopDatabases) {
        if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
            throw 'No se encontró Docker CLI para detener las bases de datos.'
        }
        Write-Host 'Deteniendo las bases de datos (se conservan los volúmenes)...'
        & docker compose -f $composeFile stop mysql
        if ($LASTEXITCODE -ne 0) {
            throw 'Falló docker compose stop.'
        }
    }
    return
}

if ($StopDatabases) {
    throw 'Usa -StopDatabases junto con -Stop.'
}
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    throw 'No se encontró Maven (mvn). Instálalo o agrega mvn al PATH.'
}
if (-not $SkipDatabase -and -not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'No se encontró Docker CLI. Instala/inicia Docker Desktop o usa -SkipDatabase si las bases ya están levantadas.'
}
if (Test-Path -LiteralPath $stateFile) {
    throw "Ya existe un archivo de estado de una ejecución anterior ($stateFile). Revisa los procesos y ejecuta este script con -Stop antes de volver a iniciarlo."
}

try {
    if (-not $SkipDatabase) {
        Write-Host 'Iniciando las bases de datos con Docker Compose...'
        & docker compose -f $composeFile up -d mysql
        if ($LASTEXITCODE -ne 0) {
            throw 'Falló docker compose up -d.'
        }
        Wait-ForDatabases
    }

    $ports = @(8761, 9001, 9002, 9003, 9006, 9008, 9013)
    foreach ($port in $ports) {
        if (Test-TcpPort -Port $port) {
            throw "El puerto $port ya está ocupado. Detén el servicio existente antes de continuar."
        }
    }

    $eureka = Start-ManagedService -Module 'eureka'
    Wait-ForTcpPort -Port $eureka.Port -Description 'Eureka' -Process $eureka.Process
    Write-Host 'Eureka está escuchando en http://localhost:8761.'

    Start-ServiceGroup -Modules @('auth', 'users')
    Start-ServiceGroup -Modules @('doctors')
    Start-ServiceGroup -Modules @('appointments')
    Start-ServiceGroup -Modules @('medical-records')

    $gateway = Start-ManagedService -Module 'gateway'
    Wait-ForTcpPort -Port $gateway.Port -Description 'Gateway' -Process $gateway.Process
    Write-Host ''
    Write-Host 'Backend iniciado. Gateway: http://localhost:9013'
    Write-Host 'Eureka: http://localhost:8761'
    Write-Host "Logs: $logRoot"
    Write-Host 'Para detener los servicios Spring: .\start-backend.ps1 -Stop'
    Write-Host 'Para detener también las bases (conservando volúmenes): .\start-backend.ps1 -Stop -StopDatabases'
}
catch {
    Write-Warning $_
    Write-Warning 'Se detendrán los procesos Spring iniciados por este script; las bases Docker quedarán levantadas.'
    Stop-ManagedProcesses
    throw
}
