# Fix sidebar links in all html/page_*.html files
# Maps Webflow absolute paths to relative file paths

$pages = Get-ChildItem "c:\Users\TREV\Documents\taskdasher\html" -Filter "page_*.html"

foreach ($page in $pages) {
    $content = Get-Content $page.FullName -Raw -Encoding UTF8
    $original = $content

    $content = $content -replace 'href="/"', 'href="../index.html"'
    $content = $content -replace 'href="/timeline"', 'href="page_2.html"'
    $content = $content -replace 'href="/messages"', 'href="page_3.html"'
    $content = $content -replace 'href="/profile"', 'href="page_4.html"'
    $content = $content -replace 'href="/contacts"', 'href="page_5.html"'
    $content = $content -replace 'href="/companies"', 'href="page_6.html"'
    $content = $content -replace 'href="https://task-dasher\.webflow\.io/category/subscriptions"', 'href="page_7.html"'
    $content = $content -replace 'href="/notifications"', 'href="page_8.html"'
    $content = $content -replace 'href="/settings"', 'href="page_9.html"'
    $content = $content -replace 'href="/help-center"', 'href="page_10.html"'
    $content = $content -replace 'href="/sign-up"', 'href="page_11.html"'
    $content = $content -replace 'href="/sign-in"', 'href="page_12.html"'
    $content = $content -replace 'href="/reset-password"', 'href="page_13.html"'
    $content = $content -replace 'href="/email-verification"', 'href="page_14.html"'
    $content = $content -replace 'href="/privacy-policy"', 'href="page_15.html"'
    $content = $content -replace 'href="/terms-and-conditions"', 'href="page_16.html"'
    $content = $content -replace 'href="https://task-dasher\.webflow\.io/404"', 'href="page_17.html"'
    $content = $content -replace 'href="https://task-dasher\.webflow\.io/search"', 'href="page_18.html"'
    $content = $content -replace 'href="https://task-dasher\.webflow\.io/401"', 'href="page_19.html"'
    $content = $content -replace 'href="/utilities/style-guide"', 'href="page_20.html"'
    $content = $content -replace 'href="/utilities/licenses"', 'href="page_21.html"'
    $content = $content -replace 'href="/utilities/changelog"', 'href="page_20.html"'

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($page.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Updated: $($page.Name)"
    } else {
        Write-Host "No changes: $($page.Name)"
    }
}

Write-Host "Done!"
