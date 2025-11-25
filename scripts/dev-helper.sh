#!/bin/bash

# Interactive helper script for micro frontend development

echo "╔════════════════════════════════════════════════════════╗"
echo "║      ENXP Micro Frontend Development Helper           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

PS3="Select an option: "
options=(
    "🚀 Start all services (micro frontend mode)"
    "🔵 Start host app only"
    "🟢 Start plugin in remote mode"
    "🟡 Start plugin in standalone mode"
    "📦 Build specific plugin"
    "📦 Build all plugins"
    "🧹 Clean all builds"
    "📚 View documentation"
    "❌ Exit"
)

select opt in "${options[@]}"
do
    case $opt in
        "🚀 Start all services (micro frontend mode)")
            echo "Starting all services..."
            ./scripts/dev-microfrontend.sh
            break
            ;;
        "🔵 Start host app only")
            echo "Starting host app..."
            cd frontend-app && pnpm run dev
            break
            ;;
        "🟢 Start plugin in remote mode")
            echo "Available plugins:"
            echo "1) projects-management (port 4001)"
            echo "2) activity-management (port 4002)"
            echo "3) templates-management (port 4003)"
            read -p "Enter plugin number: " plugin_num
            
            case $plugin_num in
                1) cd plugins/projects-management && pnpm run dev ;;
                2) cd plugins/activity-management && pnpm run dev ;;
                3) cd plugins/templates-management && pnpm run dev ;;
                *) echo "Invalid choice" ;;
            esac
            break
            ;;
        "🟡 Start plugin in standalone mode")
            echo "Available plugins:"
            echo "1) projects-management (port 4001)"
            echo "2) activity-management (port 4002)"
            echo "3) templates-management (port 4003)"
            read -p "Enter plugin number: " plugin_num
            
            case $plugin_num in
                1) cd plugins/projects-management && pnpm run dev:standalone ;;
                2) cd plugins/activity-management && pnpm run dev:standalone ;;
                3) cd plugins/templates-management && pnpm run dev:standalone ;;
                *) echo "Invalid choice" ;;
            esac
            break
            ;;
        "📦 Build specific plugin")
            read -p "Enter plugin name (e.g., projects-management): " plugin_name
            ./scripts/build-plugin.sh "$plugin_name"
            break
            ;;
        "📦 Build all plugins")
            echo "Building all plugins..."
            ./scripts/build-all-plugins.sh
            break
            ;;
        "🧹 Clean all builds")
            echo "Cleaning all builds..."
            pnpm run clean
            echo "✅ All builds cleaned"
            break
            ;;
        "📚 View documentation")
            echo ""
            echo "Documentation files:"
            echo "1) README_MICROFRONTEND.md - Main overview"
            echo "2) docs/MICRO_FRONTEND_GUIDE.md - Complete guide"
            echo "3) docs/QUICK_START.md - Quick reference"
            echo "4) docs/IMPLEMENTATION_SUMMARY.md - What was built"
            echo ""
            read -p "Open which file? (1-4): " doc_num
            
            case $doc_num in
                1) cat README_MICROFRONTEND.md | less ;;
                2) cat docs/MICRO_FRONTEND_GUIDE.md | less ;;
                3) cat docs/QUICK_START.md | less ;;
                4) cat docs/IMPLEMENTATION_SUMMARY.md | less ;;
                *) echo "Invalid choice" ;;
            esac
            break
            ;;
        "❌ Exit")
            echo "Goodbye!"
            break
            ;;
        *) 
            echo "Invalid option $REPLY"
            ;;
    esac
done
