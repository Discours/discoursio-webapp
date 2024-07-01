if [ "$VERCEL_GIT_COMMIT_REF" = "router-upgrade" ] || [ "$VERCEL_GIT_COMMIT_REF" = "feature/rating" ]; then
  echo "Building on solid start"
  exit 1
else
  echo "Not on solid start"
  exit 0
fi
