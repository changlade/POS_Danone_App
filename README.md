# Danone POS Analytics Application

A React-based application for visualizing Danone's Point of Sales (POS) data across Europe using OpenStreetMap.

## Features

### 🗺️ Interactive Map
- **OpenStreetMap Integration**: Interactive map centered on Europe
- **Custom Markers**: Different colored markers for each business type
- **Detailed Popups**: Click markers to view detailed POS information including:
  - Store name and type
  - Location (city, country, address)
  - Sales volume
  - Product families offered

### 🔍 Advanced Filtering
- **Product Families**: Filter by Danone product categories:
  - Yogurt & Desserts
  - Baby Nutrition
  - Medical Nutrition
  - Waters
  - Plant-Based
  - Dairy Alternatives

- **Business Types**: Filter by POS business types:
  - Supermarket
  - Hypermarket
  - Convenience Store
  - Pharmacy
  - Baby Store
  - Health Food Store
  - Online Retailer

- **Sales Volume Slider**: Interactive range slider to filter by sales volume

### 📊 Real-time Statistics
- Live count of active POS locations
- Total sales volume across filtered results
- Responsive design for mobile and desktop

### 🎨 Modern UI/UX
- Danone brand colors and styling
- Collapsible filter panel
- Responsive design
- Clean, professional interface

## Getting Started

### Prerequisites
- Docker and Docker Compose

### Installation & Running

1. **Clone the repository** (if applicable)
2. **Build and run with Docker**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

## Sample Data

The application includes realistic sample data with:
- **75+ POS locations** across 25 major European cities
- **Diverse business types** with appropriate sales volumes
- **Multiple product families** per location
- **Geographic distribution** covering major European markets

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Mapping**: Leaflet with React-Leaflet
- **Styling**: Custom CSS with Danone brand colors
- **Containerization**: Docker & Docker Compose
- **Build Tool**: Create React App

## Project Structure

```
src/
├── components/
│   ├── MapComponent.tsx        # Interactive map with markers
│   ├── MapComponent.css
│   ├── FilterPanel.tsx         # Filter controls
│   └── FilterPanel.css
├── types/
│   └── POSData.ts             # TypeScript interfaces
├── data/
│   └── sampleData.ts          # Sample POS data generator
├── App.tsx                    # Main application component
├── App.css                    # Main application styles
├── index.tsx                  # Application entry point
└── index.css                  # Global styles
```

## Features Overview

### Map Features
- Pan and zoom across Europe
- Custom markers with business type color coding
- Interactive popups with detailed information
- Real-time statistics overlay

### Filter Features
- Multi-select checkboxes for categorical filters
- Dual-range slider for sales volume
- Clear all filters functionality
- Collapsible panel for mobile optimization

### Responsive Design
- Desktop-first design
- Mobile-optimized filter panel
- Responsive map and statistics
- Touch-friendly controls

## Development

The application is containerized for consistent development across different environments. The Docker setup includes:
- Node.js 18 Alpine base image
- Hot reload for development
- Volume mounting for live code changes
- Optimized build process

## Brand Compliance

The application follows Danone brand guidelines:
- **Primary Blue**: #007cba
- **Light Blue**: #00a8cc
- **Green**: #00a651
- **Orange**: #ff6600
- Clean, professional typography
- Consistent spacing and layout

## Future Enhancements

Potential areas for expansion:
- Real-time data integration
- Advanced analytics and charts
- Export functionality
- User authentication
- Multi-language support
- Performance optimization for larger datasets
