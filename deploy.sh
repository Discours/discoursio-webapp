if [
    "$(git rev-parse --abbrev-ref HEAD)" = "router-upgrade"
  ] || [
    "$(git rev-parse --abbrev-ref HEAD)" = "feature/rating"
  ];
then exit 1;
else exit 0;
fi
