# ByteFit

A modern e-commerce platform for premium streetwear, built with React, TypeScript, and Firebase.

## Features

- **Gallery**: Browse and view streetwear with detailed product pages
- **Shopping Cart**: Add items to cart and proceed to checkout
- **User Authentication**: Secure login and registration system
- **Order Management**: Track order history and status
- **Admin Dashboard**: Manage products, orders, and users
- **Brand Dashboard**: Brands can manage their own products
- **Stripe Integration**: Secure payment processing
- **Responsive Design**: Optimized for all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase Functions (Firestore, Authentication, Storage)
- **Payment**: Stripe
- **Deployment**: Vercel (Frontend), Firebase Functions (Backend)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase project with Firestore, Authentication, and Storage enabled
- Stripe account for payment processing

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bytefit
   ```

2. **Frontend Setup**
   ```bash
   npm install
   ```

3. **Firebase Functions Setup**
   ```bash
   cd functions
   npm install
   cd ..
   ```

4. **Environment Configuration**
   
   **Frontend (.env):**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your configuration:
   - `REACT_APP_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `REACT_APP_FIREBASE_FUNCTIONS_URL`: Firebase Functions API URL
   
   **Firebase Functions (functions/.env):**
   ```bash
   cp functions/.env.example functions/.env
   ```
   Edit `functions/.env` and add your configuration:
   - Stripe keys and webhook secret
   - Firebase configuration
   - Email service configuration (optional)

5. **Start the Development Servers**
   
   **Firebase Functions (Terminal 1):**
   ```bash
   cd functions
   npm run serve
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   npm start
   ```

6. **Access the Application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Firebase Functions: [http://localhost:5001](http://localhost:5001)

### Test Accounts

- **Customer**: customer@bytefit.com / customer123
- **Admin**: admin@bytefit.com / admin123

### Building for Production

**Frontend:**
```bash
npm run build
```

**Firebase Functions:**
```bash
cd functions
npm run build
```

## Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Firebase Functions Deployment

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Deploy functions: `firebase deploy --only functions`

### Environment Variables for Production

**Frontend:**
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`
- `REACT_APP_FIREBASE_FUNCTIONS_URL`

**Firebase Functions:**
- `PORT`
- `NODE_ENV=production`
- `FRONTEND_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- Firebase configuration variables
- Email service variables (optional)

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── context/           # React context providers
│   ├── services/          # API service functions
│   └── config/            # Configuration files
├── functions/             # Firebase Functions (backend)
│   ├── src/               # Function source code
│   ├── utils/             # Utility functions
│   └── config/            # Function configuration
├── public/                # Static assets
└── .env.example          # Environment variables template
```

## License

This project is proprietary software developed for ByteFit.
