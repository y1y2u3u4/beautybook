# Test Workflows Guide

## 🎯 Complete Testing Workflows

This guide explains how to test the full functionality of BeautyBook using test mode.

---

## 🧪 Getting Started with Test Mode

### Step 1: Enter Test Mode
1. Visit the homepage
2. Click **🧪 Test Mode** in the navigation
3. OR click "Join as Provider" → **🧪 Enter Test Mode**
4. OR directly visit `/test-mode`

### Step 2: Select an Account
Choose from three test accounts:
- **Test Customer** - For booking and managing appointments
- **Sarah Johnson** - Provider (Radiant Skin Clinic)
- **Emily Rodriguez** - Provider (Hair Studio)

---

## 👤 Customer Workflow

### What You Can Test as a Customer:

1. **View Appointments** (`/customer/appointments`)
   - See upcoming appointments
   - View past appointments
   - Appointment details (date, time, location, price)
   - Actions: Reschedule, Cancel, Leave Review

2. **Browse Providers** (`/providers`)
   - Search and filter providers
   - View provider profiles
   - See services and pricing

3. **Book Appointments** (`/providers/[id]/book`)
   - Select a provider
   - Choose a service
   - Pick date and time
   - Enter details and confirm

### Test Scenario - Customer Journey:
```
1. Login as "Test Customer"
   → Redirected to /customer/appointments

2. View your appointments
   → See 2 upcoming appointments
   → See 1 past appointment

3. Click "Book New Appointment"
   → Browse available providers
   → Select Sarah Johnson
   → Choose "Hydrating Facial"
   → Book for next week

4. Return to My Appointments
   → See your new booking
   → Test reschedule/cancel features

5. View past appointments
   → Click "Leave a Review"
   → Click "Book Again"
```

---

## 💼 Provider Workflow

### What You Can Test as a Provider:

1. **Dashboard** (`/provider/dashboard`)
   - Overview statistics (appointments, customers, revenue, rating)
   - Upcoming appointments preview
   - Quick action buttons
   - Business analytics

2. **Appointment Management** (`/provider/appointments`)
   - View all appointments (pending, confirmed, completed, cancelled)
   - Filter by status
   - See customer details
   - Manage appointment status
   - Actions: Confirm, Complete, Reschedule, Cancel

3. **Coming Soon** (Placeholders in dashboard):
   - Service management
   - Customer management
   - Analytics & reports

### Test Scenario - Provider Journey:
```
1. Login as "Sarah Johnson" or "Emily Rodriguez"
   → Redirected to /provider/dashboard

2. View dashboard overview
   → See 24 total appointments
   → $4,280 revenue this month
   → 4.9 average rating
   → 156 total customers

3. See upcoming appointments
   → 2 appointments today
   → 1 appointment tomorrow

4. Click "Manage Appointments"
   → View all appointments
   → See pending, confirmed, completed

5. Filter appointments
   → Click "Pending" to see new requests
   → Click "Confirmed" to see scheduled appointments

6. Manage a pending appointment
   → Click "Confirm Appointment"
   → Or "Decline" if needed

7. Complete an appointment
   → Find confirmed appointment
   → Click "Mark as Completed"

8. View appointment details
   → Customer contact info
   → Service details
   → Date, time, duration
   → Price and payment status
   → Special notes
```

---

## 🔄 Switching Between Accounts

### Quick Account Switch:
1. Look at the **bottom-right corner** of the screen
2. See the yellow test mode indicator
3. Click **"Switch Account →"**
4. Select a different test account
5. Instantly switch roles

### Exit Test Mode:
1. Click the **❌** button on the test mode indicator
2. OR click "Exit Test Mode" on the test mode page
3. Returns to normal browsing mode

---

## 📊 Features You Can Test

### ✅ Fully Functional (UI Only):
- Dashboard navigation
- Appointment viewing and filtering
- Customer/Provider role switching
- Responsive design and mobile view
- Status badges and indicators
- Date and time formatting
- Contact information display

### ⚠️ Demo Data (No Database):
- All appointments are sample data
- Statistics are mock numbers
- Actions (confirm, cancel, etc.) show UI feedback only
- Data doesn't persist between sessions

### 🔌 Requires Database Connection:
- Real appointment booking
- Data persistence
- Payment processing
- Email/SMS notifications
- Calendar integration
- Search and filtering with real data

---

## 🎨 UI/UX Testing Checklist

### Customer Interface:
- [ ] Appointment list loads correctly
- [ ] Upcoming vs past appointments separated
- [ ] Status badges display properly
- [ ] Action buttons are visible
- [ ] Mobile responsive layout works
- [ ] No booking state shows correctly

### Provider Interface:
- [ ] Dashboard statistics display
- [ ] Quick action buttons work
- [ ] Appointment filters function
- [ ] Status colors are correct
- [ ] Customer details are readable
- [ ] Management actions are accessible

### Navigation:
- [ ] Test mode indicator visible
- [ ] Quick account switching works
- [ ] Back buttons navigate correctly
- [ ] Role-based redirects work
- [ ] Exit test mode functions

---

## 🐛 Known Limitations in Test Mode

1. **No Real Data**: All data is hardcoded samples
2. **No Persistence**: Changes don't save
3. **No API Calls**: Backend features need database
4. **No Authentication**: Uses localStorage, not Clerk
5. **Static Content**: Statistics don't update

---

## 🚀 Next Steps

### To Enable Full Functionality:

1. **Setup Database**
   ```bash
   # Configure DATABASE_URL in .env.local
   npm run prisma:push
   npm run seed
   ```

2. **Configure Services**
   - Add Clerk authentication keys
   - Setup Stripe for payments
   - Configure email service (SendGrid)
   - Setup SMS service (Twilio)

3. **Deploy to Production**
   - Push to Vercel/Netlify
   - Configure environment variables
   - Connect production database

---

## 💡 Tips for Testing

1. **Test Both Roles**: Switch between customer and provider to see different perspectives
2. **Check Mobile**: Use browser dev tools to test responsive design
3. **Try All Filters**: Test each appointment status filter
4. **Explore Actions**: Click all buttons to see UI feedback
5. **Note UI Issues**: Report any visual bugs or UX problems

---

## 📞 Support

For questions or issues with test mode:
- Check the main [TESTING.md](./TESTING.md) for setup instructions
- Review [README.md](./README.md) for general documentation
- Open an issue on GitHub for bugs or feature requests
