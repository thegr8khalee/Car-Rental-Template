# Car Rental Template

This is a highly configurable car rental website template. You can customize the branding, features, and content by editing the `branding.config.json` file in the root directory.

## Configuration

The `branding.config.json` file controls the following aspects of the website:

### Company Information
- **name**: Your business name.
- **legalName**: Your legal business name (used in footers, etc.).
- **tagline**: A short tagline for your business.
- **ceo**: Information about the CEO (name, bio template).

### Branding
- **colors**: Define your brand colors (primary, secondary, accent).
- **typography**: Configure fonts and sizes.
- **borderRadius**: Set the corner radius for buttons and cards.
- **assets**: Paths to your logo and favicon.

### Contact Information
- **emails**: Support, info, and sales email addresses.
- **phones**: Contact phone numbers.
- **address**: Your physical address.
- **location**: Latitude and longitude for maps.
- **hours**: Opening hours.

### Features
Toggle features on or off by setting them to `true` or `false`:
- **blog**: Enable/disable the blog section.
- **rentals**: Enable/disable car rentals/listings.
- **selling**: Enable/disable the "Sell Your Car" feature.
- **admin**: Enable/disable the admin dashboard link (still accessible via URL if authenticated).
- **showTestimonials**: Show/hide client reviews.
- **showNewsletter**: Show/hide the newsletter signup form.

## Development

1.  **Backend**:
    ```bash
    cd backend
    npm install
    npm start
    ```

2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Customization

To change the look and feel, simply edit `branding.config.json`. The frontend will automatically pick up the changes.