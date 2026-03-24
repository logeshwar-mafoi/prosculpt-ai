# Run this in your project root: D:\prosculpt-ai\prosculpt-ai
# It fixes escaped quotes in ALL .tsx and .ts files

Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $fixed = $content -replace "\\'", "'"
    if ($fixed -ne $content) {
        Set-Content -Path $_.FullName -Value $fixed -Encoding UTF8 -NoNewline
        Write-Host "Fixed: $($_.FullName)"
    }
}

Write-Host "Done! Run: npm run dev"
