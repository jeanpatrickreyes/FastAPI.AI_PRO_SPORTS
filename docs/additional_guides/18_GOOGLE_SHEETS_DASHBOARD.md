# 18 - GOOGLE SHEETS DASHBOARD GUIDE

## AI PRO SPORTS - Dashboard Integration & Reporting

---

## Table of Contents

1. Overview
2. Google Sheets Setup
3. API Integration
4. Dashboard Templates
5. Automated Data Refresh
6. Formulas & Calculations
7. Visualization Examples
8. Mobile Access
9. Sharing & Permissions
10. Troubleshooting

---

## 1. Overview

Google Sheets integration provides:
- Real-time prediction tracking
- Performance analytics
- Bankroll management
- CLV monitoring
- Daily/weekly reports

### Benefits

| Feature | Benefit |
|---------|---------|
| Cloud-based | Access from anywhere |
| Real-time sync | Always current data |
| Collaboration | Share with team |
| Mobile app | Track on the go |
| Free tier | No additional cost |

---

## 2. Google Sheets Setup

### Step 1: Create New Spreadsheet

1. Go to https://sheets.google.com
2. Click "+ Blank" to create new spreadsheet
3. Name it "AI PRO SPORTS Dashboard"

### Step 2: Create Sheets (Tabs)

Create these tabs:
1. **Dashboard** - Overview metrics
2. **Today's Picks** - Current predictions
3. **Bet Tracker** - All bets placed
4. **Performance** - Historical results
5. **Bankroll** - Financial tracking
6. **CLV Analysis** - Closing line tracking
7. **Settings** - Configuration

### Step 3: Enable Google Apps Script

1. Click Extensions → Apps Script
2. This opens the script editor
3. You'll add automation code here

---

## 3. API Integration

### Apps Script for API Calls

```javascript
// Configuration
const API_BASE_URL = 'https://your-api-domain.com/api/v1';
const API_KEY = 'your-api-key'; // Store securely in Script Properties

/**
 * Fetch today's predictions from API
 */
function fetchTodaysPredictions() {
  const url = `${API_BASE_URL}/predictions/today`;
  const options = {
    'method': 'GET',
    'headers': {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());
    return data.predictions;
  } catch (error) {
    Logger.log('Error fetching predictions: ' + error);
    return [];
  }
}

/**
 * Update Today's Picks sheet with latest predictions
 */
function updateTodaysPicks() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Today's Picks");
  const predictions = fetchTodaysPredictions();
  
  // Clear existing data (except headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 10).clearContent();
  }
  
  // Write new data
  predictions.forEach((pred, index) => {
    const row = index + 2;
    sheet.getRange(row, 1).setValue(pred.game_time);
    sheet.getRange(row, 2).setValue(pred.sport);
    sheet.getRange(row, 3).setValue(pred.matchup);
    sheet.getRange(row, 4).setValue(pred.pick);
    sheet.getRange(row, 5).setValue(pred.probability);
    sheet.getRange(row, 6).setValue(pred.signal_tier);
    sheet.getRange(row, 7).setValue(pred.odds);
    sheet.getRange(row, 8).setValue(pred.edge);
    sheet.getRange(row, 9).setValue(pred.recommended_bet);
    sheet.getRange(row, 10).setValue(pred.prediction_id);
  });
  
  // Update timestamp
  const dashboard = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dashboard');
  dashboard.getRange('B2').setValue(new Date());
}

/**
 * Fetch performance statistics
 */
function fetchPerformanceStats() {
  const url = `${API_BASE_URL}/predictions/stats?days=30`;
  const options = {
    'method': 'GET',
    'headers': {
      'Authorization': `Bearer ${API_KEY}`
    }
  };
  
  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}

/**
 * Update dashboard metrics
 */
function updateDashboard() {
  const stats = fetchPerformanceStats();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dashboard');
  
  // Overall metrics
  sheet.getRange('B5').setValue(stats.total_predictions);
  sheet.getRange('B6').setValue(stats.wins);
  sheet.getRange('B7').setValue(stats.losses);
  sheet.getRange('B8').setValue(stats.accuracy + '%');
  sheet.getRange('B9').setValue(stats.roi + '%');
  sheet.getRange('B10').setValue(stats.clv + '%');
  
  // By tier
  sheet.getRange('D5').setValue(stats.tier_a_accuracy + '%');
  sheet.getRange('D6').setValue(stats.tier_b_accuracy + '%');
  sheet.getRange('D7').setValue(stats.tier_c_accuracy + '%');
}

/**
 * Create time-based trigger for auto-refresh
 */
function createTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Update predictions every 30 minutes
  ScriptApp.newTrigger('updateTodaysPicks')
    .timeBased()
    .everyMinutes(30)
    .create();
  
  // Update dashboard every hour
  ScriptApp.newTrigger('updateDashboard')
    .timeBased()
    .everyHours(1)
    .create();
}
```

### Setting Up API Key Securely

1. In Apps Script, click ⚙️ Project Settings
2. Scroll to Script Properties
3. Add property: `API_KEY` with your key value
4. Access in code: `PropertiesService.getScriptProperties().getProperty('API_KEY')`

---

## 4. Dashboard Templates

### Dashboard Tab Layout

| Cell | Content | Formula/Value |
|------|---------|---------------|
| A1 | **AI PRO SPORTS DASHBOARD** | Header |
| B2 | Last Updated | `=NOW()` |
| A5 | Total Predictions | Label |
| B5 | (count) | API data |
| A6 | Wins | Label |
| B6 | (count) | API data |
| A7 | Losses | Label |
| B7 | (count) | API data |
| A8 | Win Rate | Label |
| B8 | (percentage) | API data |
| A9 | ROI | Label |
| B9 | (percentage) | API data |
| A10 | CLV | Label |
| B10 | (percentage) | API data |

### Today's Picks Tab Headers

| Column | Header |
|--------|--------|
| A | Game Time |
| B | Sport |
| C | Matchup |
| D | Pick |
| E | Probability |
| F | Tier |
| G | Odds |
| H | Edge |
| I | Rec. Bet |
| J | ID |
| K | Result |
| L | Profit/Loss |

### Bet Tracker Tab Headers

| Column | Header |
|--------|--------|
| A | Date |
| B | Sport |
| C | Game |
| D | Pick |
| E | Odds |
| F | Stake |
| G | To Win |
| H | Result |
| I | P/L |
| J | Running Total |
| K | Closing Line |
| L | CLV |

---

## 5. Automated Data Refresh

### Set Up Triggers

Run this once to create automated refresh:

```javascript
function setupAutomation() {
  // Clear existing triggers
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  
  // Every 30 minutes: Update predictions
  ScriptApp.newTrigger('updateTodaysPicks')
    .timeBased()
    .everyMinutes(30)
    .create();
  
  // Every hour: Update dashboard
  ScriptApp.newTrigger('updateDashboard')
    .timeBased()
    .everyHours(1)
    .create();
  
  // Daily at 6 AM: Full refresh
  ScriptApp.newTrigger('dailyRefresh')
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .create();
  
  Logger.log('Automation triggers created successfully');
}

function dailyRefresh() {
  gradeYesterdaysBets();
  updatePerformanceStats();
  updateBankrollSummary();
  sendDailyReport();
}
```

### Manual Refresh Button

Add a button to manually refresh:

1. Insert → Drawing → Create button shape
2. Save and position on sheet
3. Click button → ⋮ → Assign script
4. Enter function name: `updateTodaysPicks`

---

## 6. Formulas & Calculations

### Win Rate Calculation

```
=COUNTIF(K:K,"Win")/COUNTA(K2:K)
```

### ROI Calculation

```
=SUM(I:I)/SUM(F:F)*100
```

### CLV Average

```
=AVERAGE(L:L)
```

### Bankroll Growth

```
=Settings!B2+SUM('Bet Tracker'!I:I)
```

### Conditional Formatting for Tiers

Select Tier column → Format → Conditional formatting:
- Tier A: Green background
- Tier B: Yellow background
- Tier C: Orange background
- Tier D: Red background

### Profit/Loss Calculation

```
=IF(H2="Win", G2, IF(H2="Loss", -F2, 0))
```

### Running Total

```
=SUM($I$2:I2)
```

---

## 7. Visualization Examples

### Win Rate by Sport (Pie Chart)

1. Create summary table with sport and win counts
2. Select data
3. Insert → Chart → Pie chart
4. Customize colors and labels

### Bankroll Over Time (Line Chart)

1. Use Date and Running Total columns
2. Insert → Chart → Line chart
3. Set X-axis to Date
4. Set Y-axis to Running Total

### Tier Performance (Bar Chart)

1. Create tier summary (A, B, C accuracy)
2. Insert → Chart → Bar chart
3. Add target lines at 65%, 60%, 55%

### CLV Trend (Area Chart)

1. Use Date and CLV columns
2. Insert → Chart → Area chart
3. Add reference line at 0%

---

## 8. Mobile Access

### Google Sheets App

1. Download "Google Sheets" app on iOS/Android
2. Open your Dashboard spreadsheet
3. View predictions on the go

### Mobile-Optimized View

Create a simplified mobile sheet with just:
- Today's Tier A picks
- Current bankroll
- Daily P/L

### Widget (Android)

Add Google Sheets widget to home screen for quick access.

---

## 9. Sharing & Permissions

### Team Access

1. Click "Share" button (top right)
2. Add team member emails
3. Set permissions:
   - **Viewer**: Can see data
   - **Commenter**: Can add notes
   - **Editor**: Can modify data

### Publish Dashboard

For public read-only access:
1. File → Share → Publish to web
2. Select specific sheets to publish
3. Copy embed link

### Protecting Sensitive Data

1. Right-click sensitive sheet tab
2. Protect sheet
3. Set who can edit

---

## 10. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| API calls failing | Check API key in Script Properties |
| Data not refreshing | Verify triggers are active |
| Permission denied | Re-authorize script |
| Formulas showing error | Check referenced cells exist |

### Debug API Calls

```javascript
function testApiConnection() {
  try {
    const response = fetchTodaysPredictions();
    Logger.log('API Response: ' + JSON.stringify(response));
    return 'Success: ' + response.length + ' predictions';
  } catch (error) {
    Logger.log('Error: ' + error);
    return 'Failed: ' + error.message;
  }
}
```

### View Logs

1. In Apps Script, click "Executions" (left sidebar)
2. View recent runs and any errors
3. Click on execution to see details

### Reset Triggers

If automation stops working:
```javascript
function resetAllTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  setupAutomation();
}
```

---

## Quick Setup Checklist

- [ ] Create Google Sheet with all tabs
- [ ] Add Apps Script code
- [ ] Configure API key in Script Properties
- [ ] Set up column headers
- [ ] Add formulas
- [ ] Create charts
- [ ] Set up automation triggers
- [ ] Test API connection
- [ ] Share with team
- [ ] Install mobile app

---

## Sample Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  AI PRO SPORTS DASHBOARD           Last Updated: NOW()  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  OVERALL STATS          │  TIER PERFORMANCE             │
│  ──────────────         │  ────────────────             │
│  Predictions: 156       │  Tier A: 68%                  │
│  Wins: 89               │  Tier B: 62%                  │
│  Losses: 67             │  Tier C: 56%                  │
│  Win Rate: 57.1%        │                               │
│  ROI: +4.2%             │  [BAR CHART]                  │
│  CLV: +1.8%             │                               │
│                         │                               │
├─────────────────────────┴───────────────────────────────┤
│  TODAY'S PICKS (Tier A & B Only)                        │
│  ───────────────────────────────                        │
│  7:00 PM │ NBA │ Lakers -3.5 │ 66% │ A │ $200          │
│  8:30 PM │ NHL │ Bruins ML   │ 62% │ B │ $150          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  BANKROLL                │  [LINE CHART: Growth]        │
│  ────────                │                               │
│  Starting: $10,000       │                               │
│  Current:  $10,420       │                               │
│  Today P/L: +$85         │                               │
│                          │                               │
└─────────────────────────────────────────────────────────┘
```

---

**Guide Version:** 2.0  
**Last Updated:** January 2026
