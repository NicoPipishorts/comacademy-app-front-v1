#!/bin/bash

# Com'Academy Web Reset Password - Deployment Script
# This script helps you deploy the reset password page to your server

echo "🚀 Com'Academy Web Reset Password - Deployment Helper"
echo "=================================================="
echo ""

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found in current directory"
    echo "   Please run this script from the web-reset-password folder"
    exit 1
fi

echo "✅ Found index.html"
echo ""

# Display configuration reminder
echo "⚠️  IMPORTANT: Before deploying, verify these configurations:"
echo ""
echo "1. API URL (line ~440 in index.html):"
grep -n "const API_BASE_URL" index.html | head -1
echo ""
echo "2. Success redirect (line ~373 in index.html):"
grep -n "href=\"comacademy://" index.html | head -1
echo ""

# Ask for deployment method
echo "How would you like to deploy?"
echo ""
echo "1) Manual (copy files and upload via FTP/SFTP)"
echo "2) Display rsync command (for SSH access)"
echo "3) Display zip command (for cPanel/web upload)"
echo "4) Cancel"
echo ""
read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📋 Manual Deployment Steps:"
        echo ""
        echo "1. Copy these files to your computer:"
        echo "   - index.html"
        echo "   - .htaccess (optional, for Apache servers)"
        echo ""
        echo "2. Connect to your server via FTP/SFTP"
        echo ""
        echo "3. Upload to one of these locations:"
        echo "   Option A: /public_html/reset-password/"
        echo "   Option B: /public_html/auth/reset-password/"
        echo ""
        echo "4. Test the URL in your browser"
        echo ""
        ;;

    2)
        echo ""
        read -p "Enter your server username: " server_user
        read -p "Enter your server hostname/IP: " server_host
        read -p "Enter deployment path (e.g., /var/www/html/reset-password): " server_path

        echo ""
        echo "📋 Copy and run this rsync command:"
        echo ""
        echo "rsync -avz --progress index.html .htaccess ${server_user}@${server_host}:${server_path}/"
        echo ""
        echo "Or if you need to create the directory first:"
        echo ""
        echo "ssh ${server_user}@${server_host} 'mkdir -p ${server_path}' && rsync -avz --progress index.html .htaccess ${server_user}@${server_host}:${server_path}/"
        echo ""
        ;;

    3)
        echo ""
        echo "📦 Creating deployment zip file..."

        # Create a timestamped zip file
        timestamp=$(date +"%Y%m%d_%H%M%S")
        zip_name="comacademy_reset_password_${timestamp}.zip"

        zip -q "$zip_name" index.html .htaccess

        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Created: $zip_name"
            echo ""
            echo "📋 Deployment Steps:"
            echo ""
            echo "1. Upload $zip_name to your hosting control panel (cPanel, etc.)"
            echo "2. Extract the zip file to your desired directory"
            echo "   Recommended: /public_html/reset-password/"
            echo "3. Delete the zip file from the server"
            echo "4. Test the URL in your browser"
            echo ""
        else
            echo ""
            echo "❌ Error creating zip file"
            exit 1
        fi
        ;;

    4)
        echo ""
        echo "Deployment cancelled."
        exit 0
        ;;

    *)
        echo ""
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo "=================================================="
echo ""
echo "📝 After deployment, remember to:"
echo ""
echo "1. Test the page: https://comacademy.fr/reset-password/?code=test"
echo "2. Update your email templates with the new URL"
echo "3. Test the complete flow (request reset → receive email → click link → reset password)"
echo ""
echo "🎉 Good luck with your deployment!"
echo ""
