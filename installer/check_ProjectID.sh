echo "Your MMM-GoogleAssistant project_id is: \c"
cat credentials.json 2>/dev/null | grep -oP '(?<="project_id":")[^"]*' || {
  echo "credentials not found!"
}
echo "---"
echo "Your SmartHome project_id is: \c"
cat smarthome.json 2>/dev/null | grep -oP '(?<="project_id": ")[^"]*' || {
  echo "smarthome credentials not found!"
}
echo "\n"
