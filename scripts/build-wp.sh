
#!/usr/bin/env bash
set -euo pipefail

PLUGIN_NAME="farm-react-test"
BUILD_DIR="dist"
PACKAGE_DIR="wordpress-plugin"
PLUGIN_DIR="$PACKAGE_DIR/$PLUGIN_NAME"

# Always run from the project root
cd "$(dirname "$0")/.."

echo "Building React application..."
npm run build

echo "Preparing WordPress plugin..."
rm -rf "$PLUGIN_DIR"
mkdir -p "$PLUGIN_DIR"

cp farm-react-test.php "$PLUGIN_DIR/"
cp -r "$BUILD_DIR/assets" "$PLUGIN_DIR/"

echo "Creating WordPress ZIP..."
rm -f "$PACKAGE_DIR/$PLUGIN_NAME.zip"

(
  cd "$PACKAGE_DIR"
  zip -qr "$PLUGIN_NAME.zip" "$PLUGIN_NAME"
)

echo ""
echo "Build complete!"
echo "Plugin: $PACKAGE_DIR/$PLUGIN_NAME.zip"
