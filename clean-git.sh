git filter-branch --tag-name-filter 'cat' -f --tree-filter '
    find . -type d -name binarydir | while read dir
      do
        find $dir -type f -name "*.ear" -o -name "*.war" -o -name "*.jar" -o -name "*.zip" -o -name "*.exe" | while read file
          do
             git rm -r -f --ignore-unmatch $file
          done
      done
' -- --all
