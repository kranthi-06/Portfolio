$base = "e:\portfolio-me\app\admin"
$dashGroup = Join-Path $base "(dashboard)"

# Create dashboard group dir if not exists
if (!(Test-Path $dashGroup)) { New-Item -Path $dashGroup -ItemType Directory -Force | Out-Null }

# Move root page
$rootPage = Join-Path $base "page.tsx"
if (Test-Path $rootPage) {
    Copy-Item $rootPage (Join-Path $dashGroup "page.tsx") -Force
    Remove-Item $rootPage -Force
    Write-Output "Moved root page.tsx"
}

# Move section pages
$dirs = @("certificates","projects","events","achievements","gallery","skills","experience","resume","settings","messages","analytics","github","media","ai","logs")
foreach ($d in $dirs) {
    $srcDir = Join-Path $base $d
    $srcPage = Join-Path $srcDir "page.tsx"
    if (Test-Path $srcPage) {
        $destDir = Join-Path $dashGroup $d
        if (!(Test-Path $destDir)) { New-Item -Path $destDir -ItemType Directory -Force | Out-Null }
        Copy-Item $srcPage (Join-Path $destDir "page.tsx") -Force
        Remove-Item $srcPage -Force
        Write-Output "Moved $d/page.tsx"
    }
}

# Remove now-empty old directories (if empty)
foreach ($d in $dirs) {
    $srcDir = Join-Path $base $d
    if ((Test-Path $srcDir) -and ((Get-ChildItem $srcDir -Recurse -File).Count -eq 0)) {
        Remove-Item $srcDir -Recurse -Force
        Write-Output "Removed empty dir $d"
    }
}

Write-Output "Done!"
