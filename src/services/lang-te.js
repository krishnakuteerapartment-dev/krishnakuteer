/* Telugu wording (English -> తెలుగు) and the translator. Loaded only when Telugu is selected (see lang.js).
   TO FIX A TELUGU WORD: find the English line in the list below (TE) and change only the Telugu part on the right. */
(function () {
  "use strict";
  /* Telugu letters join together, so the site's extra letter-spacing must be switched off */
  var css2 = document.createElement("style");
  css2.textContent = "html[lang=te] *{letter-spacing:normal!important}";
  document.head.appendChild(css2);

  /* ---------- Telugu wording (English  ->  తెలుగు) ---------- */
  var TE = {
    "Saved": "సేవ్ అయింది", "Complaint sent": "ఫిర్యాదు పంపబడింది", "Making PDF…": "PDF తయారవుతోంది…",
    "Still saving. Please try again in a moment.": "ఇంకా సేవ్ అవుతోంది. కొద్దిసేపటి తర్వాత మళ్ళీ ప్రయత్నించండి.",
    "Still uploading. Please wait a moment.": "ఇంకా అప్‌లోడ్ అవుతోంది. కొద్దిసేపు వేచి ఉండండి.",
    "please try again": "దయచేసి మళ్ళీ ప్రయత్నించండి",
    /* menu */
    "Home": "హోమ్", "Maintenance": "నిర్వహణ", "Payments": "చెల్లింపులు", "Expenses": "ఖర్చులు", "Statement": "స్టేట్‌మెంట్",
    "Celebrations": "వేడుకలు", "Visitors": "సందర్శకులు", "Documents": "పత్రాలు", "Notices": "నోటీసులు",
    "Complaints": "ఫిర్యాదులు", "Meetings": "సమావేశాలు", "Voting": "ఓటింగ్",
    "Open menu": "మెనూ తెరవండి", "Close menu": "మెనూ మూసివేయండి", "Go to Home": "హోమ్‌కి వెళ్ళండి",
    "Password": "పాస్‌వర్డ్", "Change password": "పాస్‌వర్డ్ మార్చండి", "Sign out": "సైన్ అవుట్",
    "admin": "అడ్మిన్", "treasurer": "కోశాధికారి", "secretary": "కార్యదర్శి", "president": "అధ్యక్షుడు", "executive": "కార్యనిర్వాహకుడు", "resident": "నివాసి",
    "Admin": "అడ్మిన్", "Treasurer": "కోశాధికారి", "Secretary": "కార్యదర్శి", "President": "అధ్యక్షుడు", "Executive": "కార్యనిర్వాహకుడు", "Resident": "నివాసి",

    /* sign in, password, e-mail */
    "Sign in": "సైన్ ఇన్", "Sign in to your account": "మీ ఖాతాలోకి సైన్ ఇన్ అవ్వండి", "Select your ID": "మీ ఐడిని ఎంచుకోండి",
    "Please select your ID.": "దయచేసి మీ ఐడిని ఎంచుకోండి.", "Your login password": "మీ లాగిన్ పాస్‌వర్డ్",
    "Forgot password?": "పాస్‌వర్డ్ మర్చిపోయారా?", "Back to sign in": "సైన్ ఇన్‌కి తిరిగి వెళ్ళండి",
    "Reset password": "పాస్‌వర్డ్ రీసెట్ చేయండి", "Send code": "కోడ్ పంపండి", "Send a new code": "కొత్త కోడ్ పంపండి", "New code sent": "కొత్త కోడ్ పంపబడింది",
    "We will e-mail a 6-digit code to the e-mail saved for your ID.": "మీ ఐడికి సేవ్ చేసిన ఇ-మెయిల్‌కు 6 అంకెల కోడ్ పంపుతాము.",
    "Code sent to": "కోడ్ పంపిన చిరునామా:", ". It works for 10 minutes.": ". ఇది 10 నిమిషాలు మాత్రమే పనిచేస్తుంది.",
    "6-digit code": "6 అంకెల కోడ్", "Enter the code": "కోడ్ నమోదు చేయండి", "Enter the 6-digit code from your e-mail.": "మీ ఇ-మెయిల్‌లోని 6 అంకెల కోడ్‌ను నమోదు చేయండి.",
    "New password (min 6 characters)": "కొత్త పాస్‌వర్డ్ (కనీసం 6 అక్షరాలు)", "Repeat new password": "కొత్త పాస్‌వర్డ్‌ను మళ్ళీ నమోదు చేయండి",
    "Save password": "పాస్‌వర్డ్ సేవ్ చేయండి", "Password changed": "పాస్‌వర్డ్ మార్చబడింది", "Password changed. Please sign in.": "పాస్‌వర్డ్ మార్చబడింది. దయచేసి సైన్ ఇన్ అవ్వండి.",
    "Set your own password": "మీ స్వంత పాస్‌వర్డ్ పెట్టుకోండి", "For safety, please replace the starting password.": "భద్రత కోసం, ప్రారంభ పాస్‌వర్డ్‌ను మార్చండి.",
    "Choose a new password of at least 6 characters, different from the starting one.": "ప్రారంభ పాస్‌వర్డ్ కంటే భిన్నమైన, కనీసం 6 అక్షరాల కొత్త పాస్‌వర్డ్‌ను ఎంచుకోండి.",
    "The two passwords do not match.": "రెండు పాస్‌వర్డ్‌లు సరిపోలలేదు.", "Wrong password. Try again.": "పాస్‌వర్డ్ తప్పు. మళ్ళీ ప్రయత్నించండి.",
    "Confirm with your password": "మీ పాస్‌వర్డ్‌తో నిర్ధారించండి", "Confirm": "నిర్ధారించండి", "Cancel": "రద్దు చేయండి", "Skip for now": "ఇప్పుడు వద్దు",
    "Verify your e-mail": "మీ ఇ-మెయిల్‌ను ధృవీకరించండి", "Add recovery e-mail": "రికవరీ ఇ-మెయిల్ జోడించండి", "Change e-mail": "ఇ-మెయిల్ మార్చండి", "E-mail verified": "ఇ-మెయిల్ ధృవీకరించబడింది",
    "We sent a 6-digit code to": "మేము 6 అంకెల కోడ్‌ను పంపాము:", "We use it to reset your password if you forget it.": "మీరు పాస్‌వర్డ్ మర్చిపోతే రీసెట్ చేయడానికి దీన్ని ఉపయోగిస్తాము.",
    "Please enter a valid e-mail address.": "దయచేసి సరైన ఇ-మెయిల్ చిరునామా నమోదు చేయండి.", "Verify": "ధృవీకరించండి", "you@gmail.com": "you@gmail.com",
    "Something went wrong. Please try again.": "ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",

    /* common buttons and words */
    "Save": "సేవ్ చేయండి", "Delete": "తొలగించండి", "Retry": "మళ్ళీ ప్రయత్నించండి", "Upload": "అప్‌లోడ్", "Download": "డౌన్‌లోడ్", "Next": "తదుపరి", "Previous": "మునుపటి",
    "Enter": "నమోదు", "Loading": "లోడ్ అవుతోంది", "Please wait": "దయచేసి వేచి ఉండండి", "Please wait…": "దయచేసి వేచి ఉండండి…", "Uploading…": "అప్‌లోడ్ అవుతోంది…", "Opening…": "తెరుస్తోంది…",
    "Open": "తెరిచి ఉంది", "Closed": "మూసివేయబడింది", "Date": "తేదీ", "Time": "సమయం", "Today": "ఈ రోజు", "Total": "మొత్తం", "TOTAL": "మొత్తం", "Status": "స్థితి", "Details": "వివరాలు",
    "Remarks": "వ్యాఖ్యలు", "Remarks (optional)": "వ్యాఖ్యలు (ఐచ్ఛికం)", "Amount": "మొత్తం", "Amount:": "మొత్తం:", "Amount (₹)": "మొత్తం (₹)", "Category": "వర్గం", "Mode": "విధానం",
    "Month": "నెల", "Year": "సంవత్సరం", "Week": "వారం", "Daily": "రోజువారీ", "Weekly": "వారానికి", "Monthly": "నెలవారీ", "Yearly": "వార్షిక", "This week": "ఈ వారం", "This month": "ఈ నెల", "This year": "ఈ సంవత్సరం",
    "Earlier": "ఇంతకు ముందు", "Upcoming": "రాబోయేవి", "Upcoming events": "రాబోయే కార్యక్రమాలు", "Previous day": "క్రితం రోజు", "Next day": "తరువాతి రోజు", "Hour": "గంట", "Minutes": "నిమిషాలు", "AM": "ఉ.", "PM": "సా.", "AM or PM": "ఉదయం లేదా సాయంత్రం",
    "Page": "పేజీ", "Device": "పరికరం", "Varies": "మారుతుంది", "Place": "ప్రదేశం", "Title": "శీర్షిక", "Question": "ప్రశ్న", "Photo": "ఫోటో", "Flat": "ఫ్లాట్", "Flat No.": "ఫ్లాట్ నం.", "Flat:": "ఫ్లాట్:",
    "S.No": "క్ర.సం.", "Sl.No": "క్ర.సం.", "Download CSV": "CSV డౌన్‌లోడ్", "Download photo": "ఫోటో డౌన్‌లోడ్", "⬇ Download": "⬇ డౌన్‌లోడ్", "Open / Download": "తెరవండి / డౌన్‌లోడ్",
    "🖨 Print": "🖨 ప్రింట్", "🖨 Print this page": "🖨 ఈ పేజీని ప్రింట్ చేయండి", "Print / Save as PDF": "ప్రింట్ / PDF గా సేవ్", "Print all entries": "అన్ని ఎంట్రీలను ప్రింట్ చేయండి", "Print all notices": "అన్ని నోటీసులను ప్రింట్ చేయండి",
    "Print all celebrations": "అన్ని వేడుకలను ప్రింట్ చేయండి", "Print full year": "పూర్తి సంవత్సరం ప్రింట్", "Print monthly statement": "నెలవారీ స్టేట్‌మెంట్ ప్రింట్", "Print this period": "ఈ కాలాన్ని ప్రింట్ చేయండి",
    "Could not load this page.": "ఈ పేజీని లోడ్ చేయలేకపోయాము.", "Could not open the print window": "ప్రింట్ విండో తెరవలేకపోయాము",
    "Could not reach Google Sheets. Check your internet connection and try again.": "Google Sheets ను చేరుకోలేకపోయాము. మీ ఇంటర్నెట్ కనెక్షన్ తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి.",
    "This browser cannot print from here. Please update it.": "ఈ బ్రౌజర్ ఇక్కడ నుండి ప్రింట్ చేయలేదు. దయచేసి అప్‌డేట్ చేయండి.", "Preparing your data…": "మీ డేటాను సిద్ధం చేస్తున్నాము…",
    "New version ready. Tap here to refresh.": "కొత్త వెర్షన్ సిద్ధంగా ఉంది. రిఫ్రెష్ చేయడానికి ఇక్కడ నొక్కండి.", "Setup needed": "సెటప్ అవసరం",
    "Delete this entry?": "ఈ ఎంట్రీని తొలగించాలా?", "Delete this entry? This is recorded in the audit log.": "ఈ ఎంట్రీని తొలగించాలా? ఇది ఆడిట్ లాగ్‌లో నమోదు అవుతుంది.",
    "Delete this expense? This is recorded in the audit log.": "ఈ ఖర్చును తొలగించాలా? ఇది ఆడిట్ లాగ్‌లో నమోదు అవుతుంది.", "Delete this file?": "ఈ ఫైల్‌ను తొలగించాలా?", "Delete this maintenance entry?": "ఈ నిర్వహణ ఎంట్రీని తొలగించాలా?",
    "Nothing recorded.": "ఏమీ నమోదు కాలేదు.", "Nothing yet.": "ఇంకా ఏమీ లేదు.", "Nothing scheduled yet.": "ఇంకా ఏమీ షెడ్యూల్ కాలేదు.", "View only": "చూడటానికి మాత్రమే",
    "dd/mm/yyyy": "dd/mm/yyyy", "Recent activity": "ఇటీవలి కార్యకలాపాలు", "Latest notices": "తాజా నోటీసులు",

    /* home, status and money */
    "Apartment": "అపార్ట్‌మెంట్", "Apartment status": "అపార్ట్‌మెంట్ స్థితి", "Active": "సక్రియం", "Attention": "శ్రద్ధ అవసరం",
    "Water": "నీరు", "Lift": "లిఫ్ట్", "Generator": "జనరేటర్", "Electricity": "విద్యుత్", "Security": "భద్రత", "CCTV": "సీసీటీవీ", "Solar Fencing": "సోలార్ ఫెన్సింగ్", "Cleaning": "శుభ్రత",
    "Balance in hand": "చేతిలో ఉన్న నిల్వ", "Balance": "నిల్వ", "Cash": "నగదు", "Bank / UPI": "బ్యాంక్ / UPI", "Bank/UPI": "బ్యాంక్/UPI", "Online Payment": "ఆన్‌లైన్ చెల్లింపు",
    "Monthly statement": "నెలవారీ స్టేట్‌మెంట్", "Monthly statement is not available yet.": "నెలవారీ స్టేట్‌మెంట్ ఇంకా అందుబాటులో లేదు.", "Month by month": "నెల వారీగా", "Month by month (net, closing)": "నెల వారీగా (నికరం, ముగింపు)",
    "Total flats": "మొత్తం ఫ్లాట్లు", "Maintenance per Flat": "ఫ్లాట్‌కు నిర్వహణ రుసుము", "Not decided yet": "ఇంకా నిర్ణయించలేదు", "Paid": "చెల్లించారు", "Paid this month": "ఈ నెల చెల్లించారు", "Due": "బకాయి", "Pending amount": "బకాయి మొత్తం",
    "Pending (₹)": "బకాయి (₹)", "Maintenance (₹)": "నిర్వహణ (₹)", "Amount Paid (₹)": "చెల్లించిన మొత్తం (₹)", "Net": "నికరం", "Closing": "ముగింపు", "Opening balance": "ప్రారంభ నిల్వ", "Opening balance (1 Jan)": "ప్రారంభ నిల్వ (1 జనవరి)",
    "Opening balance saved": "ప్రారంభ నిల్వ సేవ్ అయింది", "Save opening balance": "ప్రారంభ నిల్వ సేవ్ చేయండి", "(money in hand when you start using this app)": "(ఈ యాప్ వాడటం మొదలుపెట్టినప్పుడు చేతిలో ఉన్న డబ్బు)",
    "Closing in bank/UPI": "బ్యాంక్/UPIలో ముగింపు", "Closing in cash": "నగదులో ముగింపు", "Previous month balance": "క్రితం నెల నిల్వ", "Corpus fund": "కార్పస్ ఫండ్", "Corpus fund interest": "కార్పస్ ఫండ్ వడ్డీ",
    "Other income": "ఇతర ఆదాయం", "Other income received this month": "ఈ నెల వచ్చిన ఇతర ఆదాయం", "Income": "ఆదాయం", "Total income": "మొత్తం ఆదాయం", "Total expenses": "మొత్తం ఖర్చులు", "TOTAL EXPENSES": "మొత్తం ఖర్చులు",
    "Current month collected amount": "ఈ నెల వసూలైన మొత్తం", "Current month expenses amount": "ఈ నెల ఖర్చుల మొత్తం", "Category summary": "వర్గాల వారీ సారాంశం",
    "Opening Balance (₹) (OB)": "ప్రారంభ నిల్వ (₹) (OB)", "Maintenance Collected (₹) (MC)": "వసూలైన నిర్వహణ (₹) (MC)", "Other Income (₹) (OI)": "ఇతర ఆదాయం (₹) (OI)",
    "Total Available Amount (₹) (AA)": "మొత్తం అందుబాటులో ఉన్న మొత్తం (₹) (AA)", "Total Expenses (₹) (E)": "మొత్తం ఖర్చులు (₹) (E)", "Closing Balance (₹) (CB)": "ముగింపు నిల్వ (₹) (CB)",
    "Amounts in ₹": "మొత్తాలు ₹ లో", "Maintenance receipts": "నిర్వహణ రసీదులు", "Maintenance Receipt": "నిర్వహణ రసీదు",

    /* payments, maintenance log, expenses */
    "Record payment": "చెల్లింపు నమోదు", "Save payment": "చెల్లింపు సేవ్ చేయండి", "Payment date (when money was received)": "చెల్లింపు తేదీ (డబ్బు అందిన రోజు)", "Payment Date": "చెల్లింపు తేదీ", "Payment mode": "చెల్లింపు విధానం",
    "Payment details": "చెల్లింపు వివరాలు", "Transaction reference (optional)": "లావాదేవీ రిఫరెన్స్ (ఐచ్ఛికం)", "Counts toward maintenance for the month selected above.": "పైన ఎంచుకున్న నెల నిర్వహణ రుసుముకు లెక్కలోకి వస్తుంది.",
    "Month/Year": "నెల/సంవత్సరం", "Maintenance payments": "నిర్వహణ చెల్లింపులు", "Maintenance entry added": "నిర్వహణ ఎంట్రీ చేర్చబడింది", "No maintenance entries in this period.": "ఈ కాలంలో నిర్వహణ ఎంట్రీలు లేవు.",
    "Add maintenance": "నిర్వహణ జోడించండి", "Add entry": "ఎంట్రీ జోడించండి", "Save entry": "ఎంట్రీ సేవ్ చేయండి", "Details, e.g. Lift servicing": "వివరాలు, ఉదా. లిఫ్ట్ సర్వీసింగ్",
    "Add expense": "ఖర్చు జోడించండి", "Save expense": "ఖర్చు సేవ్ చేయండి", "Expense Details": "ఖర్చు వివరాలు", "Expense date": "ఖర్చు తేదీ", "Paid To": "ఎవరికి చెల్లించారు", "Paid to": "ఎవరికి చెల్లించారు",
    "Expense details, e.g. Tap installation": "ఖర్చు వివరాలు, ఉదా. ట్యాప్ బిగింపు", "Expense details, e.g. Decoration": "ఖర్చు వివరాలు, ఉదా. అలంకరణ", "No expenses this month": "ఈ నెల ఖర్చులు లేవు",
    "Status updated": "స్థితి నవీకరించబడింది", "Completed": "పూర్తయింది", "Pending": "పెండింగ్", "Partial": "పాక్షికం",
    "Amount to collect from each flat (₹)": "ప్రతి ఫ్లాట్ నుండి వసూలు చేయాల్సిన మొత్తం (₹)", "Showing each flat's default amount until this month's amount is set.": "ఈ నెల మొత్తం నిర్ణయించే వరకు ప్రతి ఫ్లాట్ యొక్క డిఫాల్ట్ మొత్తం చూపబడుతోంది.",
    "Review the figures, then lock the month with your password. A locked month cannot be changed.": "లెక్కలను సరిచూసి, మీ పాస్‌వర్డ్‌తో నెలను లాక్ చేయండి. లాక్ చేసిన నెలను మార్చలేరు.",
    "Reopen month (admin)": "నెలను మళ్ళీ తెరవండి (అడ్మిన్)", "Month closed": "నెల ముగించబడింది", "Month unlocked. It will lock again automatically in 15 minutes.": "నెల అన్‌లాక్ అయింది. 15 నిమిషాల్లో మళ్ళీ ఆటోమేటిక్‌గా లాక్ అవుతుంది.",
    "Enter an amount above 0": "0 కంటే ఎక్కువ మొత్తం నమోదు చేయండి", "Enter the amount per flat": "ఫ్లాట్‌కు మొత్తం నమోదు చేయండి", "Enter a valid date (dd/mm/yyyy)": "సరైన తేదీ నమోదు చేయండి (dd/mm/yyyy)",
    "Enter a valid payment date (dd/mm/yyyy)": "సరైన చెల్లింపు తేదీ నమోదు చేయండి (dd/mm/yyyy)", "Enter a valid date (dd/mm/yyyy) and an amount above 0": "సరైన తేదీ (dd/mm/yyyy) మరియు 0 కంటే ఎక్కువ మొత్తం నమోదు చేయండి",
    "Enter a valid date (dd/mm/yyyy) and the details": "సరైన తేదీ (dd/mm/yyyy) మరియు వివరాలు నమోదు చేయండి", "Download all data": "మొత్తం డేటా డౌన్‌లోడ్", "Backup (JSON)": "బ్యాకప్ (JSON)", "Excel (all sheets)": "ఎక్సెల్ (అన్ని షీట్లు)",
    "Every payment, expense, income entry, flat, monthly amount, closed month and notice, from the beginning.": "మొదటి నుండి ప్రతి చెల్లింపు, ఖర్చు, ఆదాయ ఎంట్రీ, ఫ్లాట్, నెలవారీ మొత్తం, ముగించిన నెల మరియు నోటీసు.",
    "No flats found.": "ఫ్లాట్లు కనబడలేదు.",

    /* celebrations, visitors */
    "Celebration": "వేడుక", "Celebration name": "వేడుక పేరు", "Celebration name (e.g. Ganesh Chaturthi 2026)": "వేడుక పేరు (ఉదా. గణేష్ చతుర్థి 2026)", "Celebration statement": "వేడుక స్టేట్‌మెంట్", "All celebrations": "అన్ని వేడుకలు",
    "Festival / event": "పండుగ / కార్యక్రమం", "Festival": "పండుగ", "Event": "కార్యక్రమం", "Add contribution": "విరాళం జోడించండి", "Add sponsor": "స్పాన్సర్ జోడించండి", "Sponsors": "స్పాన్సర్లు", "Total sponsors": "మొత్తం స్పాన్సర్లు", "Total contributions": "మొత్తం విరాళాలు",
    "Income · flat contributions": "ఆదాయం · ఫ్లాట్ విరాళాలు", "Select flats": "ఫ్లాట్లను ఎంచుకోండి", "Sponsor flat no. (you can select more than one)": "స్పాన్సర్ ఫ్లాట్ నం. (ఒకటి కంటే ఎక్కువ ఎంచుకోవచ్చు)", "Sponsor flat no.": "స్పాన్సర్ ఫ్లాట్ నం.",
    "Sponsor details, e.g. Prasad / Flowers / Lights": "స్పాన్సర్ వివరాలు, ఉదా. ప్రసాదం / పూలు / లైట్లు", "Date received": "అందిన తేదీ", "Details (e.g. collected after verification)": "వివరాలు (ఉదా. ధృవీకరణ తర్వాత వసూలు చేశారు)",
    "Enter the celebration name first": "ముందు వేడుక పేరు నమోదు చేయండి", "Enter a valid date, the details and an amount above 0": "సరైన తేదీ, వివరాలు మరియు 0 కంటే ఎక్కువ మొత్తం నమోదు చేయండి",
    "Enter the sponsor details and select at least one flat": "స్పాన్సర్ వివరాలు నమోదు చేసి కనీసం ఒక ఫ్లాట్‌ను ఎంచుకోండి", "No celebrations yet. Add the first contribution or expense below.": "ఇంకా వేడుకలు లేవు. క్రింద మొదటి విరాళం లేదా ఖర్చును జోడించండి.",
    "Add visitors": "సందర్శకులను జోడించండి", "Number of visitors": "సందర్శకుల సంఖ్య", "Visitors count": "సందర్శకుల సంఖ్య", "Enter the number of visitors": "సందర్శకుల సంఖ్యను నమోదు చేయండి", "e.g. 25": "ఉదా. 25",

    /* documents and photos */
    "Apartment documents": "అపార్ట్‌మెంట్ పత్రాలు", "Open the shared Google Drive folder to view all documents.": "అన్ని పత్రాలను చూడటానికి షేర్ చేసిన Google Drive ఫోల్డర్‌ను తెరవండి.", "View documents": "పత్రాలు చూడండి",
    "📂 Folder": "📂 ఫోల్డర్", "All folders": "అన్ని ఫోల్డర్లు", "PDF documents": "PDF పత్రాలు", "Add a PDF (everyone can open it)": "PDF జోడించండి (అందరూ తెరవగలరు)", "Title e.g. Bye-laws 2026": "శీర్షిక ఉదా. నియమావళి 2026",
    "Upload PDF": "PDF అప్‌లోడ్", "No PDF files yet.": "ఇంకా PDF ఫైళ్లు లేవు.", "Photos & important pictures": "ఫోటోలు & ముఖ్యమైన చిత్రాలు", "Add pictures (everyone can see them)": "చిత్రాలను జోడించండి (అందరూ చూడగలరు)",
    "Caption e.g. Annual meeting 2026": "శీర్షిక ఉదా. వార్షిక సమావేశం 2026", "No pictures yet.": "ఇంకా చిత్రాలు లేవు.", "Please add a photo first.": "ముందు ఒక ఫోటోను జోడించండి.", "Please choose a PDF file.": "దయచేసి ఒక PDF ఫైల్‌ను ఎంచుకోండి.",
    "Only PDF files are allowed.": "PDF ఫైళ్లు మాత్రమే అనుమతించబడతాయి.", "File not available": "ఫైల్ అందుబాటులో లేదు", "Could not read that photo": "ఆ ఫోటోను చదవలేకపోయాము",
    "PDF must be under 1 MB. Please compress it first (for example at ilovepdf.com, Compress PDF) and upload again.": "PDF 1 MB కంటే తక్కువ ఉండాలి. దయచేసి ముందు దాన్ని కుదించి (ఉదా. ilovepdf.com లో Compress PDF) మళ్ళీ అప్‌లోడ్ చేయండి.",
    "Agenda & M.O.M": "ఎజెండా & సమావేశ నివేదికలు", "Apartment Works": "అపార్ట్‌మెంట్ పనులు", "Association": "అసోసియేషన్", "GHMC & Plumber": "GHMC & ప్లంబర్", "Monthly Register": "నెలవారీ రిజిస్టర్",
    "Watchmen Salary": "వాచ్‌మెన్ జీతాలు", "Watchmen Salary & Cleaning Purchases": "వాచ్‌మెన్ జీతాలు & శుభ్రత కొనుగోళ్లు", "Dust Collector": "డస్ట్ కలెక్టర్", "Motor": "మోటార్", "CCTV Camera": "CCTV కెమెరా", "Complaints": "ఫిర్యాదులు", "Water (HMWSSB) & Water Related": "నీరు (HMWSSB) & నీటికి సంబంధించినవి", "Other": "ఇతరాలు",
    "📷 Take photo": "📷 ఫోటో తీయండి", "🖼 From gallery": "🖼 గ్యాలరీ నుండి", "📷 Add photo": "📷 ఫోటో జోడించండి",
    "📷 Scan paper with camera": "📷 పేపర్‌ను కెమెరాతో స్కాన్ చేయండి", "Please choose a PDF file or scan a paper.": "దయచేసి PDF ఫైల్‌ను ఎంచుకోండి లేదా పేపర్‌ను స్కాన్ చేయండి.",
    "Could not make the PDF. Please try again.": "PDF తయారు చేయలేకపోయాము. దయచేసి మళ్ళీ ప్రయత్నించండి.",

    /* notices, complaints, voice notes */
    "Notice": "నోటీసు", "Notice board": "నోటీసు బోర్డు", "Notice title": "నోటీసు శీర్షిక", "Post notice": "నోటీసు పోస్ట్ చేయండి",
    "Raise a complaint": "ఫిర్యాదు చేయండి", "What is the problem? e.g. Lift not working": "సమస్య ఏమిటి? ఉదా. లిఫ్ట్ పని చేయడం లేదు", "More details (optional)": "మరిన్ని వివరాలు (ఐచ్ఛికం)", "Submit complaint": "ఫిర్యాదు సమర్పించండి",
    "Please describe the problem.": "దయచేసి సమస్యను వివరించండి.", "All complaints": "అన్ని ఫిర్యాదులు", "Your complaints": "మీ ఫిర్యాదులు", "No complaints. 🎉": "ఫిర్యాదులు లేవు. 🎉",
    "In progress": "పురోగతిలో ఉంది", "Resolved": "పరిష్కరించబడింది",
    "🎤 Record voice note": "🎤 వాయిస్ నోట్ రికార్డ్ చేయండి", "Remove": "తీసివేయండి", "▶ Play voice note": "▶ వాయిస్ నోట్ వినండి", "Loading voice note…": "వాయిస్ నోట్ లోడ్ అవుతోంది…",
    "Voice note not available": "వాయిస్ నోట్ అందుబాటులో లేదు", "Recording is not supported on this phone.": "ఈ ఫోన్‌లో రికార్డింగ్‌కు మద్దతు లేదు.",
    "Microphone is not allowed. Please allow Microphone for this app in your phone Settings.": "మైక్రోఫోన్‌కు అనుమతి లేదు. దయచేసి ఫోన్ సెట్టింగ్స్‌లో ఈ యాప్‌కు మైక్రోఫోన్ అనుమతి ఇవ్వండి.",
    "Voice note is too short. Please try again.": "వాయిస్ నోట్ చాలా చిన్నదిగా ఉంది. దయచేసి మళ్ళీ ప్రయత్నించండి.", "Voice note is too big. Please record a shorter one.": "వాయిస్ నోట్ చాలా పెద్దదిగా ఉంది. దయచేసి చిన్నది రికార్డ్ చేయండి.",

    /* meetings and voting */
    "Add meeting or event": "సమావేశం లేదా కార్యక్రమం జోడించండి", "Meeting": "సమావేశం", "Title, e.g. Monthly meeting": "శీర్షిక, ఉదా. నెలవారీ సమావేశం",
    "New poll": "కొత్త ఓటింగ్", "Options separated by commas, e.g. Yes, No": "ఎంపికలను కామాతో వేరు చేయండి, ఉదా. అవును, కాదు", "Start poll": "ఓటింగ్ ప్రారంభించండి", "Close poll": "ఓటింగ్ ముగించండి", "No polls yet.": "ఇంకా ఓటింగ్‌లు లేవు.",

    /* months */
    "Jan": "జన", "Feb": "ఫిబ్ర", "Mar": "మార్చి", "Apr": "ఏప్రి", "May": "మే", "Jun": "జూన్", "Jul": "జూలై", "Aug": "ఆగ", "Sep": "సెప్టెం", "Oct": "అక్టో", "Nov": "నవం", "Dec": "డిసెం",

    /* other work categories */
    "Administrative": "పరిపాలన", "Diesel": "డీజిల్", "Electrical": "ఎలక్ట్రికల్", "Garden": "తోట", "Pest Control": "పురుగుల నియంత్రణ", "Plumbing": "ప్లంబింగ్", "Repairs": "మరమ్మతులు", "Watchman": "వాచ్‌మెన్"
  };
  /* ---------- sentences with changing parts (names, months, numbers) ---------- */
  var PAT = [
    [/^Not saved: ([\s\S]*)$/, function (m, a) { return "సేవ్ కాలేదు: " + tr(a); }],
    [/^([\s\S]*) · Event$/, function (m, a) { return a + " · కార్యక్రమం"; }],
    [/^([\s\S]*) · Meeting$/, function (m, a) { return a + " · సమావేశం"; }],
    [/^(\S+) Complaint resolved: ([\s\S]*)$/, function (m, i, a) { return i + " ఫిర్యాదు పరిష్కరించబడింది: " + a; }],
    [/^(🛠 [\s\S]*) \(pending\)$/, function (m, a) { return a + " (పెండింగ్)"; }],
    [/^(🛠 [\s\S]*) \(partial\)$/, function (m, a) { return a + " (పాక్షికం)"; }],
    [/^Flat (.+?) · (.*)$/, function (m, a, b) { return "ఫ్లాట్ " + a + " · " + b; }],
    [/^Flat (.+)$/, function (m, a) { return "ఫ్లాట్ " + a; }],
    [/^Namaste 🙏, (.*)$/, function (m, a) { return "నమస్తే 🙏, " + tr(a); }],
    [/^Collected in (.*)$/, function (m, a) { return a + " లో వసూలైనది"; }],
    [/^Pending in (.*)$/, function (m, a) { return a + " లో బకాయి"; }],
    [/^Expenses in (.*)$/, function (m, a) { return a + " లో ఖర్చులు"; }],
    [/^for (\d{4}-\d{2})$/, function (m, a) { return a + " కోసం"; }],
    [/^Save amount for (.*)$/, function (m, a) { return a + " కోసం మొత్తం సేవ్ చేయండి"; }],
    [/^Close (\d{4}-\d{2})$/, function (m, a) { return a + " నెలను ముగించండి"; }],
    [/^Month: (.*)$/, function (m, a) { return "నెల: " + a; }],
    [/^Mode: (.*)$/, function (m, a) { return "విధానం: " + a; }],
    [/^Reference: (.*)$/, function (m, a) { return "రిఫరెన్స్: " + a; }],
    [/^Date: (.*)$/, function (m, a) { return "తేదీ: " + a; }],
    [/^Receipt #(.*)$/, function (m, a) { return "రసీదు #" + a; }],
    [/^My payment history · (.*) paid$/, function (m, a) { return "నా చెల్లింపుల చరిత్ర · " + a + " చెల్లించారు"; }],
    [/^Outstanding up to (.*): (.*)$/, function (m, a, b) { return a + " వరకు బకాయి: " + b; }],
    [/^Advance paid: (.*)$/, function (m, a) { return "ముందుగా చెల్లించినది: " + a; }],
    [/^All dues cleared up to (.*)$/, function (m, a) { return a + " వరకు అన్ని బకాయిలు తీరాయి"; }],
    [/^(Open|Closed) · (\d+) votes?$/, function (m, s, n) { return (s === "Open" ? "తెరిచి ఉంది" : "ముగిసింది") + " · " + n + (+n === 1 ? " ఓటు" : " ఓట్లు"); }],
    [/^You voted: (.*)$/, function (m, a) { return "మీరు ఓటు వేశారు: " + a; }],
    [/^Cash (.*) · Bank\/UPI (.*)$/, function (m, a, b) { return "నగదు " + a + " · బ్యాంక్/UPI " + b; }],
    [/^Opening (.*) \+ received (.*) − spent (.*)$/, function (m, a, b, c) { return "ప్రారంభం " + a + " + వచ్చినది " + b + " − ఖర్చు " + c; }],
    [/^Income (.*) − Expenses (.*)$/, function (m, a, b) { return "ఆదాయం " + a + " − ఖర్చులు " + b; }],
    [/^From (.*) to (.*)$/, function (m, a, b) { return a + " నుండి " + b + " వరకు"; }],
    [/^Maximum (\d+) photos$/, function (m, a) { return "గరిష్టంగా " + a + " ఫోటోలు"; }],
    [/^Maximum (\d+) pages$/, function (m, a) { return "గరిష్టంగా " + a + " పేజీలు"; }],
    [/^Scanned pages: (\d+) \(max (\d+)\)$/, function (m, a, b) { return "స్కాన్ చేసిన పేజీలు: " + a + " (గరిష్టం " + b + ")"; }],
    [/^⏹ Stop · (.*)$/, function (m, a) { return "⏹ ఆపండి · " + a; }],
    [/^Downloaded (.*)$/, function (m, a) { return a + " డౌన్‌లోడ్ అయింది"; }],
    [/^Payment saved for (.*)$/, function (m, a) { return a + " కోసం చెల్లింపు సేవ్ అయింది"; }],
    [/^Expense saved in (.*)$/, function (m, a) { return a + " లో ఖర్చు సేవ్ అయింది"; }],
    [/^Saved in (.*)$/, function (m, a) { return a + " లో సేవ్ అయింది"; }],
    [/^Maintenance per flat saved for (.*)$/, function (m, a) { return a + " కోసం ఫ్లాట్‌కు నిర్వహణ రుసుము సేవ్ అయింది"; }],
    [/^Saved: (\d+) visitors on (.*)$/, function (m, a, b) { return b + " న " + a + " మంది సందర్శకులు సేవ్ అయ్యారు"; }],
    [/^(\d{4}-\d{2}(?:-\d{2})?) locked again automatically$/, function (m, a) { return a + " మళ్ళీ ఆటోమేటిక్‌గా లాక్ అయింది"; }],
    [/^(.*) is locked\.$/, function (m, a) { return a + " లాక్ చేయబడింది."; }],
    [/^Locking (.*): payments, expenses and income dated in this month can no longer be added, changed or deleted\. Enter your login password to lock\.$/,
      function (m, a) { return a + " ను లాక్ చేస్తున్నారు: ఈ నెల తేదీ గల చెల్లింపులు, ఖర్చులు, ఆదాయాన్ని ఇకపై జోడించలేరు, మార్చలేరు, తొలగించలేరు. లాక్ చేయడానికి మీ లాగిన్ పాస్‌వర్డ్ నమోదు చేయండి."; }],
    [/^Unlocking (.*) lets its figures change again \(recorded in the audit log\)\. It locks itself again after 15 minutes\. Enter your login password to unlock\.$/,
      function (m, a) { return a + " ను అన్‌లాక్ చేస్తే లెక్కలు మళ్ళీ మార్చవచ్చు (ఆడిట్ లాగ్‌లో నమోదు అవుతుంది). 15 నిమిషాల తర్వాత అది మళ్ళీ లాక్ అవుతుంది. అన్‌లాక్ చేయడానికి మీ లాగిన్ పాస్‌వర్డ్ నమోదు చేయండి."; }]
  ];


  /* ---------- Assets, Reminders, Meeting management, Emergency contacts, Visitor register, Complaint tracking, Audit log ---------- */
  var TE2 = {
    "Meeting management": "సమావేశ నిర్వహణ", "Meeting": "సమావేశం", "Contacts": "కాంటాక్ట్‌లు", "Assets": "ఆస్తులు", "Reminders": "రిమైండర్లు", "Emergency contacts": "అత్యవసర నంబర్లు", "Emergency": "అత్యవసరం", "Audit log": "ఆడిట్ లాగ్",
    "Edit": "మార్చండి", "Show": "చూపించు", "Clear": "తొలగించు", "Print": "ప్రింట్", "Search": "వెతకండి", "Notes": "గమనికలు", "Name": "పేరు", "Phone": "ఫోన్", "Type": "రకం", "From": "నుండి", "To": "వరకు",
    "Agenda": "అజెండా", "Minutes": "సమావేశ వివరాలు", "Attendance": "హాజరు", "Action items": "చేయవలసిన పనులు", "Meeting record": "సమావేశ రికార్డు", "Add action item": "చేయవలసిన పని జోడించండి",
    "Resolutions & decisions": "తీర్మానాలు & నిర్ణయాలు", "Task": "పని", "Responsible": "బాధ్యులు", "Responsible person": "బాధ్యత వహించే వ్యక్తి", "Due": "గడువు", "Due date": "గడువు తేదీ",
    "Draft": "డ్రాఫ్ట్", "Published": "ప్రచురించబడింది", "Minutes available": "సమావేశ వివరాలు అందుబాటులో ఉన్నాయి", "Edit record": "రికార్డు మార్చండి", "Record attendance & minutes": "హాజరు & వివరాలు నమోదు చేయండి",
    "Publish to residents": "నివాసులకు ప్రచురించండి", "Unpublish": "ప్రచురణ ఆపండి", "🖨 Print minutes": "🖨 సమావేశ వివరాలు ప్రింట్", "Earlier meetings": "గత సమావేశాలు", "Done": "పూర్తయింది",
    "Flats present": "హాజరైన ఫ్లాట్లు", "Agenda (one point per line)": "అజెండా (ఒక్కో అంశం ఒక్కో లైన్‌లో)", "Minutes (what was discussed)": "సమావేశ వివరాలు (ఏమి చర్చించారు)",
    "Resolutions & decisions (one per line)": "తీర్మానాలు & నిర్ణయాలు (ఒక్కోటి ఒక్కో లైన్‌లో)", "Others present (Association members, guests)": "ఇతర హాజరైనవారు (అసోసియేషన్ సభ్యులు, అతిథులు)",
    "The agenda is shown to everybody. Attendance, minutes, resolutions and action items stay with the Association until you tap “Publish to residents”.": "అజెండా అందరికీ కనిపిస్తుంది. హాజరు, వివరాలు, తీర్మానాలు, చేయవలసిన పనులు “నివాసులకు ప్రచురించండి” నొక్కే వరకు అసోసియేషన్‌కు మాత్రమే కనిపిస్తాయి.",
    "Working": "పనిచేస్తోంది", "Under repair": "రిపేర్‌లో ఉంది", "Out of service": "పనిచేయడం లేదు", "Lift": "లిఫ్ట్", "Generator": "జనరేటర్", "Motor": "మోటార్", "Water pump": "నీటి పంపు", "CCTV": "CCTV", "Battery / inverter": "బ్యాటరీ / ఇన్వర్టర్", "Other": "ఇతర",
    "Installed": "అమర్చిన తేదీ", "Installed on": "అమర్చిన తేదీ", "Warranty / AMC": "వారంటీ / AMC", "Warranty / AMC ends on": "వారంటీ / AMC ముగింపు తేదీ", "Supplier": "సరఫరాదారు", "Model / serial": "మోడల్ / సీరియల్",
    "Last service": "చివరి సర్వీస్", "Next due": "తదుపరి గడువు", "Not recorded yet": "ఇంకా నమోదు కాలేదు", "Service & repair cost": "సర్వీస్ & రిపేర్ ఖర్చు", "📞 Call supplier": "📞 సరఫరాదారుకు కాల్", "Expired": "గడువు ముగిసింది",
    "+ Add service / repair": "+ సర్వీస్ / రిపేర్ జోడించండి", "🖨 Print asset register": "🖨 ఆస్తుల రిజిస్టర్ ప్రింట్", "Add an item": "వస్తువు జోడించండి", "Save item": "వస్తువు సేవ్ చేయండి", "Item": "వస్తువు",
    "Condition": "స్థితి", "Location": "స్థలం", "Supplier / service company": "సరఫరాదారు / సర్వీస్ కంపెనీ", "Supplier phone": "సరఫరాదారు ఫోన్", "Model": "మోడల్", "Serial number": "సీరియల్ నంబర్",
    "Work done": "చేసిన పని", "Work": "పని", "Done by": "చేసినవారు", "Cost": "ఖర్చు", "Cost (₹)": "ఖర్చు (₹)", "Service": "సర్వీస్", "Repair": "రిపేర్", "Inspection": "తనిఖీ", "Replacement": "మార్పు",
    "Next service due (optional, creates a reminder)": "తదుపరి సర్వీస్ గడువు (ఐచ్ఛికం, రిమైండర్ తయారవుతుంది)", "No service recorded yet.": "ఇంకా ఏ సర్వీస్ నమోదు కాలేదు.", "Item saved": "వస్తువు సేవ్ అయింది", "Service record saved": "సర్వీస్ రికార్డు సేవ్ అయింది",
    "Overdue": "గడువు దాటింది", "Upcoming": "రాబోయేవి", "Completed": "పూర్తయినవి", "Due in 30 days": "30 రోజుల్లో గడువు", "Due today": "ఈరోజు గడువు", "Mark done": "పూర్తయినట్లు గుర్తించండి", "Add a reminder": "రిమైండర్ జోడించండి",
    "Save reminder": "రిమైండర్ సేవ్ చేయండి", "What is due": "ఏమి చేయాలి", "Item (optional)": "వస్తువు (ఐచ్ఛికం)", "Due on": "గడువు తేదీ", "Repeat": "మళ్ళీ", "Alert this many days before": "ఇన్ని రోజుల ముందు హెచ్చరిక",
    "Does not repeat": "ఒక్కసారి మాత్రమే", "Every month": "ప్రతి నెల", "Every 3 months": "ప్రతి 3 నెలలకు", "Every 6 months": "ప్రతి 6 నెలలకు", "Every year": "ప్రతి సంవత్సరం", "Warranty": "వారంటీ", "AMC renewal": "AMC పునరుద్ధరణ",
    "Warranties & AMC": "వారంటీలు & AMC", "Nothing overdue. 👍": "గడువు దాటినవి ఏవీ లేవు. 👍", "Nothing scheduled. Add a reminder below.": "ఏమీ షెడ్యూల్ కాలేదు. క్రింద రిమైండర్ జోడించండి.",
    "Lift servicing": "లిఫ్ట్ సర్వీసింగ్", "Generator maintenance": "జనరేటర్ నిర్వహణ", "Battery warranty ends": "బ్యాటరీ వారంటీ ముగింపు", "Water tank cleaning": "నీటి ట్యాంక్ శుభ్రపరచడం",
    "🔔 Service reminders": "🔔 సర్వీస్ రిమైండర్లు", "Marked done": "పూర్తయినట్లు గుర్తించారు", "Reminder saved": "రిమైండర్ సేవ్ అయింది", "Done on": "పూర్తయిన తేదీ",
    "Association phones that turned on alerts get one reminder message a day (after 8 AM) when something is coming up or overdue.": "హెచ్చరికలు ఆన్ చేసిన అసోసియేషన్ ఫోన్లకు, ఏదైనా గడువు దగ్గరపడినా లేదా దాటినా రోజుకు ఒక రిమైండర్ (ఉదయం 8 తర్వాత) వస్తుంది.",
    "Tap Call to phone straight away.": "వెంటనే ఫోన్ చేయడానికి కాల్ నొక్కండి.", "📞 Call": "📞 కాల్", "📞 Other no.": "📞 ఇతర నంబర్", "Not verified": "ధృవీకరించలేదు", "Mark verified today": "ఈరోజు ధృవీకరించినట్లు గుర్తించండి",
    "Add a contact": "నంబర్ జోడించండి", "Save contact": "నంబర్ సేవ్ చేయండి", "Edit emergency numbers": "అత్యవసర నంబర్లు మార్చండి", "For": "కోసం", "Other phone (optional)": "ఇతర ఫోన్ (ఐచ్ఛికం)",
    "Fire": "అగ్నిమాపక", "Ambulance": "అంబులెన్స్", "Police": "పోలీస్", "Lift technician": "లిఫ్ట్ టెక్నీషియన్", "Generator service": "జనరేటర్ సర్వీస్", "Electrician": "ఎలక్ట్రీషియన్", "Plumber": "ప్లంబర్", "Security / watchman": "సెక్యూరిటీ / వాచ్‌మెన్",
    "Fire service": "అగ్నిమాపక సేవ", "All emergencies (national)": "అన్ని అత్యవసరాలు (జాతీయ)", "🖨 Print contact list": "🖨 నంబర్ల జాబితా ప్రింట్",
    "Record a visitor": "సందర్శకుడిని నమోదు చేయండి", "Visitor name": "సందర్శకుడి పేరు", "Flat visited": "వెళ్ళిన ఫ్లాట్", "Purpose": "ఉద్దేశ్యం", "Phone (optional, Association only)": "ఫోన్ (ఐచ్ఛికం, అసోసియేషన్‌కు మాత్రమే)", "Entry time": "లోపలికి వచ్చిన సమయం", "Exit time (leave empty if still inside)": "బయటకు వెళ్ళిన సమయం (ఇంకా లోపల ఉంటే ఖాళీగా వదలండి)", "Exit time must be after the entry time": "బయటకు వెళ్ళిన సమయం లోపలికి వచ్చిన సమయం తర్వాత ఉండాలి",
    "Save visitor": "సందర్శకుడిని సేవ్ చేయండి", "Exit now": "ఇప్పుడు బయటకు", "Inside": "లోపల ఉన్నారు", "Visitor register": "సందర్శకుల రిజిస్టర్", "Visitors to your flat": "మీ ఫ్లాట్‌కు వచ్చిన సందర్శకులు", "Visitor": "సందర్శకుడు",
    "All flats": "అన్ని ఫ్లాట్లు", "Search name or purpose": "పేరు లేదా ఉద్దేశ్యం వెతకండి", "No visitors found.": "సందర్శకులు ఎవరూ లేరు.", "Add a visitor count (no names)": "సందర్శకుల సంఖ్య జోడించండి (పేర్లు లేకుండా)", "Save count": "సంఖ్య సేవ్ చేయండి",
    "Visitor saved": "సందర్శకుడు సేవ్ అయ్యారు", "Exit time saved": "బయటకు వెళ్ళిన సమయం సేవ్ అయింది", "Common area / office": "కామన్ ఏరియా / ఆఫీస్", "🖨 Print register": "🖨 రిజిస్టర్ ప్రింట్",
    "Guest / relative": "అతిథి / బంధువు", "Delivery / courier": "డెలివరీ / కొరియర్", "Service / repair": "సర్వీస్ / రిపేర్", "Cab / taxi": "క్యాబ్ / టాక్సీ", "Domestic help": "ఇంటి పనివారు", "Official visit": "అధికారిక సందర్శన",
    "Raised": "నమోదు", "Related to": "సంబంధించినది", "Assigned to": "అప్పగించినది", "Not assigned yet": "ఇంకా ఎవరికీ అప్పగించలేదు", "Expected by": "పూర్తవుతుందని అంచనా", "Last update": "చివరి మార్పు", "Status history": "స్థితి చరిత్ర",
    "Update status": "స్థితి మార్చండి", "Save update": "మార్పు సేవ్ చేయండి", "Expected completion": "పూర్తయ్యే అంచనా తేదీ", "Note for the resident (optional)": "నివాసికి గమనిక (ఐచ్ఛికం)", "Complaint raised": "ఫిర్యాదు నమోదైంది",
    "Related to (optional): choose an item": "సంబంధించినది (ఐచ్ఛికం): వస్తువు ఎంచుకోండి", "No complaints match.": "సరిపోయే ఫిర్యాదులు లేవు.", "🖨 Print complaint register": "🖨 ఫిర్యాదుల రిజిస్టర్ ప్రింట్",
    "You get a ticket number, and an alert on your phone whenever the status changes.": "మీకు టికెట్ నంబర్ వస్తుంది, స్థితి మారిన ప్రతిసారి మీ ఫోన్‌కు హెచ్చరిక వస్తుంది.", "Updated. The resident gets an alert.": "మార్చబడింది. నివాసికి హెచ్చరిక వెళ్తుంది.",
    "Section": "విభాగం", "All sections": "అన్ని విభాగాలు", "Action": "చర్య", "All actions": "అన్ని చర్యలు", "Everybody": "అందరూ", "Added": "జోడించారు", "Changed": "మార్చారు", "Deleted": "తొలగించారు", "Loading…": "లోడ్ అవుతోంది…",
    "Every addition, change and deletion of money entries (payments, expenses, income, month locks) and other important records, with who did it and when. Entries cannot be changed or deleted from the app.": "డబ్బు నమోదులు (చెల్లింపులు, ఖర్చులు, ఆదాయం, నెల లాక్) మరియు ఇతర ముఖ్యమైన రికార్డులలో ప్రతి జోడింపు, మార్పు, తొలగింపు – ఎవరు, ఎప్పుడు చేశారో. వీటిని యాప్ నుండి మార్చలేరు, తొలగించలేరు.",
    "Nothing recorded for this choice.": "ఈ ఎంపికకు ఏమీ నమోదు కాలేదు.", "Association only": "అసోసియేషన్‌కు మాత్రమే", "Everyone can see it": "అందరూ చూడవచ్చు", "Association only (residents cannot see it)": "అసోసియేషన్‌కు మాత్రమే (నివాసులు చూడలేరు)",
    "Add a PDF": "PDF జోడించండి", "Apartment documents in Google Drive": "గూగుల్ డ్రైవ్‌లో అపార్ట్‌మెంట్ పత్రాలు", "Choose a folder…": "ఫోల్డర్ ఎంచుకోండి…", "Folder": "ఫోల్డర్", "Open folder in Google Drive": "గూగుల్ డ్రైవ్‌లో ఫోల్డర్ తెరవండి", "Could not load the folder links.": "ఫోల్డర్ లింకులు లోడ్ కాలేదు.", "Add pictures": "ఫోటోలు జోడించండి"
  };
  var TE3 = {
    "🔔 Ask flat to approve": "🔔 ఫ్లాట్ అనుమతి అడగండి", "Save without asking": "అడగకుండా సేవ్ చేయండి", "Waiting for flat": "ఫ్లాట్ సమాధానం కోసం", "No answer": "సమాధానం లేదు",
    "Approved": "అనుమతించారు", "Denied": "నిరాకరించారు", "Leave at gate": "గేట్ వద్ద ఉంచండి", "Pre-approved": "ముందే అనుమతి", "Always allowed": "ఎల్లప్పుడూ అనుమతి", "Cancelled": "రద్దు",
    "Approve": "అనుమతించు", "Deny": "నిరాకరించు", "Ask again": "మళ్ళీ అడగండి", "Mark no answer": "సమాధానం లేదని గుర్తించండి", "Mark exit": "బయటకు వెళ్ళినట్లు గుర్తించండి", "Let in": "లోపలికి అనుమతించండి",
    "Guest code": "అతిథి కోడ్", "Check": "చెక్ చేయండి", "Answered": "సమాధానం వచ్చింది", "At the gate now": "ఇప్పుడు గేట్ వద్ద",
    "Guest passes": "అతిథి పాస్‌లు", "Guest's name": "అతిథి పేరు", "One visit (code)": "ఒక్కసారి (కోడ్)", "Make guest pass": "అతిథి పాస్ తయారు చేయండి", "Share code": "కోడ్ పంపండి", "One visit": "ఒక్కసారి",
    "To (same day if one day)": "వరకు (ఒక్క రోజైతే అదే రోజు)", "Until (leave empty: no end date)": "వరకు (ఖాళీగా వదిలితే: ముగింపు లేదు)", "Phone number for the gate": "గేట్ కోసం ఫోన్ నంబర్", "Watchman (gate)": "వాచ్‌మెన్ (గేట్)", "Watchman": "వాచ్‌మెన్",
    "If you don't answer the alert, the watchman can call this number. Only the gate and the Association can see it.": "మీరు హెచ్చరికకు సమాధానం ఇవ్వకపోతే వాచ్‌మెన్ ఈ నంబర్‌కు కాల్ చేయవచ్చు. గేట్ మరియు అసోసియేషన్ మాత్రమే చూడగలరు.",
    "Phone number saved": "ఫోన్ నంబర్ సేవ్ అయింది", "Pass cancelled": "పాస్ రద్దు అయింది", "Approval": "అనుమతి", "Watchman": "వాచ్‌మెన్", "Attendance & leave": "హాజరు & సెలవు", "Attendance": "హాజరు", "Apply for leave": "సెలవుకు దరఖాస్తు", "Leave history": "సెలవుల చరిత్ర", "Paid leave": "జీతంతో సెలవు", "Unpaid leave": "జీతం లేని సెలవు", "Paid": "జీతంతో", "Unpaid": "జీతం లేకుండా",
    "Waiting for approval": "అనుమతి కోసం ఎదురుచూస్తోంది", "Not approved": "అనుమతించలేదు", "Approve (paid)": "అనుమతించు (జీతంతో)", "Approve (unpaid)": "అనుమతించు (జీతం లేకుండా)", "Reject": "తిరస్కరించు", "Reason (optional)": "కారణం (ఐచ్ఛికం)",
    "✓ Mark present today": "✓ ఈరోజు హాజరు నమోదు", "Marked present": "హాజరు నమోదైంది", "Present": "హాజరు", "Half day": "సగం రోజు", "Absent": "గైర్హాజరు", "Not marked": "నమోదు కాలేదు", "Print attendance": "హాజరు ప్రింట్", "🖨 Print attendance": "🖨 హాజరు ప్రింట్",
    "Paid leaves used": "వాడిన జీతం సెలవులు", "Unpaid leave days": "జీతం లేని సెలవు రోజులు", "Present this month": "ఈ నెల హాజరు", "Half days": "సగం రోజులు", "Leave days": "సెలవు రోజులు", "On leave today": "ఈరోజు సెలవులో ఉన్నారు",
    "Watchmen": "వాచ్‌మెన్‌లు", "Add a watchman": "వాచ్‌మెన్‌ను జోడించండి", "Add watchman": "వాచ్‌మెన్‌ను జోడించండి", "Joined on": "చేరిన తేదీ", "Paid leaves per year": "సంవత్సరానికి జీతం సెలవులు", "Working": "పనిచేస్తున్నారు", "Left / inactive": "వెళ్ళిపోయారు",
    "Save leave and post notice": "సెలవు సేవ్ చేసి నోటీసు పెట్టండి", "Tap a day to mark Present, Half day or Absent.": "హాజరు, సగం రోజు లేదా గైర్హాజరు నమోదుకు రోజును నొక్కండి.", "📷 Photos from the Association": "📷 అసోసియేషన్ పంపిన ఫోటోలు",
    "Photos for the resident (optional, up to 3)": "నివాసికి ఫోటోలు (ఐచ్ఛికం, 3 వరకు)", "Status history": "స్థితి చరిత్ర", "Close": "మూసివేయండి", "Clear": "తొలగించు", "Are you happy with how this was fixed?": "సమస్య పరిష్కరించిన తీరుతో మీరు సంతోషంగా ఉన్నారా?", "(optional)": "(ఐచ్ఛికం)", "👍 Yes": "👍 అవును", "👎 No": "👎 లేదు", "Add a note (optional)": "గమనిక జోడించండి (ఐచ్ఛికం)", "👍 Satisfied": "👍 సంతృప్తి", "👎 Not satisfied": "👎 సంతృప్తి లేదు", "(your feedback)": "(మీ అభిప్రాయం)", "Change": "మార్చండి", "No feedback from the flat yet.": "ఫ్లాట్ నుండి ఇంకా అభిప్రాయం రాలేదు.", "Thank you for your feedback 👍": "మీ అభిప్రాయానికి ధన్యవాదాలు 👍", "Thank you. The Association has been told.": "ధన్యవాదాలు. అసోసియేషన్‌కు తెలియజేశాము.", "Feedback updated": "అభిప్రాయం మార్చబడింది", "Feedback": "అభిప్రాయం", "Entered by flat": "ఫ్లాట్ వారు నమోదు చేశారు", "Watchman not at the gate?": "గేట్ వద్ద వాచ్‌మెన్ లేరా?", "Show": "చూపించు", "Guest passes & gate phone numbers": "అతిథి పాస్‌లు & గేట్ ఫోన్ నంబర్లు"
  };
  for (var k3 in TE3) if (Object.prototype.hasOwnProperty.call(TE3, k3)) TE[k3] = TE3[k3];
  /* Assets: Major assets and Minor items (chairs, bulbs and other small things bought for common use) */
  var TE4 = {
    "Good": "బాగుంది", "Damaged": "పాడైంది", "Lost": "పోయింది", "Used up": "వాడేశారు", "Lost / used up": "పోయినవి / వాడేసినవి",
    "Quantity": "సంఖ్య", "Unit": "కొలమానం", "Qty": "సంఖ్య", "Bought on": "కొన్న తేదీ", "Total cost (₹)": "మొత్తం ఖర్చు (₹)", "Bought from (shop)": "ఎక్కడ కొన్నారు (షాప్)",
    "Kept at": "ఎక్కడ ఉంచారు", "Add a minor item": "చిన్న వస్తువు జోడించండి", "Quick pick:": "త్వరగా ఎంచుకోండి:", "🖨 Print minor items": "🖨 చిన్న వస్తువుల జాబితా ప్రింట్",
    "Spent on minor items:": "చిన్న వస్తువులపై ఖర్చు:", "Minor items": "చిన్న వస్తువులు", "No minor items added yet.": "ఇంకా చిన్న వస్తువులు జోడించలేదు.",
    "No minor items added yet. Add chairs, bulbs, buckets and other small things bought for the apartment below.": "ఇంకా చిన్న వస్తువులు జోడించలేదు. అపార్ట్‌మెంట్ కోసం కొన్న కుర్చీలు, బల్బులు, బకెట్లు వంటి చిన్న వస్తువులను క్రింద జోడించండి.",
    "e.g. Plastic chairs, LED bulbs": "ఉదా. ప్లాస్టిక్ కుర్చీలు, LED బల్బులు", "e.g. Terrace store room": "ఉదా. టెర్రస్ స్టోర్ రూమ్", "Brand, size, who has it…": "బ్రాండ్, సైజు, ఎవరి దగ్గర ఉంది…",
    "Enter the name of the item": "వస్తువు పేరు నమోదు చేయండి", "Enter the name of the item.": "వస్తువు పేరు నమోదు చేయండి.",
    "Enter the quantity (0 or more)": "సంఖ్య నమోదు చేయండి (0 లేదా అంతకంటే ఎక్కువ)", "Enter the quantity (0 or more).": "సంఖ్య నమోదు చేయండి (0 లేదా అంతకంటే ఎక్కువ).",
    "Enter a cost of 0 or more": "ఖర్చు 0 లేదా అంతకంటే ఎక్కువ నమోదు చేయండి", "Enter a cost of 0 or more.": "ఖర్చు 0 లేదా అంతకంటే ఎక్కువ నమోదు చేయండి.",
    "Delete this item? This is recorded in the audit log.": "ఈ వస్తువును తొలగించాలా? ఇది ఆడిట్ లాగ్‌లో నమోదవుతుంది.",
    "🪑 Furniture": "🪑 ఫర్నిచర్", "💡 Electrical": "💡 ఎలక్ట్రికల్", "🧹 Cleaning": "🧹 శుభ్రపరచడం", "🚿 Plumbing": "🚿 ప్లంబింగ్", "🌱 Garden": "🌱 తోట", "🔒 Security": "🔒 భద్రత",
    "🎉 Festival / decoration": "🎉 పండుగ / అలంకరణ", "🍽 Kitchen / utensils": "🍽 వంటగది / పాత్రలు", "🧰 Tools": "🧰 పనిముట్లు", "📒 Stationery": "📒 స్టేషనరీ", "📦 Other": "📦 ఇతరాలు",
    "🪑 Plastic chairs": "🪑 ప్లాస్టిక్ కుర్చీలు", "💡 LED bulbs": "💡 LED బల్బులు", "💡 Tube lights": "💡 ట్యూబ్ లైట్లు", "💡 Extension board": "💡 ఎక్స్‌టెన్షన్ బోర్డు",
    "🧹 Brooms & mops": "🧹 చీపుర్లు & మాప్‌లు", "🧹 Buckets & mugs": "🧹 బకెట్లు & మగ్గులు", "🧹 Dustbins": "🧹 చెత్త డబ్బాలు", "🌱 Water hose pipe": "🌱 నీటి పైపు",
    "🔒 Padlocks": "🔒 తాళాలు", "🧰 Tool kit": "🧰 టూల్ కిట్"
  };
  for (var k4 in TE4) if (Object.prototype.hasOwnProperty.call(TE4, k4) && !Object.prototype.hasOwnProperty.call(TE, k4)) TE[k4] = TE4[k4];
  /* Home charts */
  var TE5 = {
    "Overview": "అవలోకనం", "Fully paid": "పూర్తిగా చెల్లించారు", "Insights": "విశ్లేషణ", "Coming up": "రాబోయేవి", "Money": "డబ్బు", "Received": "వచ్చినది", "Spent": "ఖర్చు", "Left": "మిగిలినది",
    "Overspent": "అధిక ఖర్చు", "left": "మిగిలింది", "overspent": "అధిక ఖర్చు", "Maintenance collection": "నిర్వహణ వసూలు", "flats paid": "చెల్లించాయి",
    "Received vs spent": "వచ్చినది vs ఖర్చు", "6 months": "6 నెలలు", "12 months": "12 నెలలు", "Tap a month to see its figures.": "లెక్కలు చూడటానికి ఒక నెలను తాకండి.",
    "Where the money went": "డబ్బు ఎక్కడ ఖర్చయింది", "Your complaints": "మీ ఫిర్యాదులు", "Open Statement": "స్టేట్‌మెంట్ తెరవండి", "Service reminder": "సర్వీస్ రిమైండర్",
    "Closing balance (cash + bank):": "ముగింపు నిల్వ (నగదు + బ్యాంక్):", "Corpus fund is kept separately and not counted here.": "కార్పస్ ఫండ్ విడిగా ఉంటుంది, ఇక్కడ లెక్కించలేదు.",
    "Assets": "ఆస్తులు", "January": "జనవరి", "February": "ఫిబ్రవరి", "March": "మార్చి", "April": "ఏప్రిల్", "May": "మే", "June": "జూన్", "July": "జూలై",
    "August": "ఆగస్టు", "September": "సెప్టెంబర్", "October": "అక్టోబర్", "November": "నవంబర్", "December": "డిసెంబర్"
  };
  for (var k5 in TE5) if (Object.prototype.hasOwnProperty.call(TE5, k5) && !Object.prototype.hasOwnProperty.call(TE, k5)) TE[k5] = TE5[k5];
  var MONTE = { January: "జనవరి", February: "ఫిబ్రవరి", March: "మార్చి", April: "ఏప్రిల్", May: "మే", June: "జూన్", July: "జూలై", August: "ఆగస్టు", September: "సెప్టెంబర్", October: "అక్టోబర్", November: "నవంబర్", December: "డిసెంబర్" };
  var monTe = function (s) { return s.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/, function (m) { return MONTE[m]; }); };
  PAT.push(
    [/^((?:January|February|March|April|May|June|July|August|September|October|November|December) \d{4})$/, function (m, a) { return monTe(a); }],
    [/^(\d+) in all$/, function (m, a) { return "మొత్తం " + a; }],
    [/^(₹[\d,]+) of (₹[\d,]+) collected \((\d+)%\)$/, function (m, a, b, c) { return b + " లో " + a + " వసూలైంది (" + c + "%)"; }],
    [/^Last 30 days · busiest: (\d+) on (.+)$/, function (m, a, b) { return "గత 30 రోజులు · ఎక్కువ: " + b + " న " + a; }],
    [/^Last 30 days$/, function () { return "గత 30 రోజులు"; }],
    [/^Maintenance (₹[\d,]+) pending$/, function (m, a) { return "నిర్వహణ " + a + " బకాయి"; }],
    [/^(.+) · pay the Treasurer$/, function (m, a) { return monTe(a) + " · కోశాధికారికి చెల్లించండి"; }],
    [/^Warranty \/ AMC ends: (.+)$/, function (m, a) { return "వారంటీ / AMC ముగింపు: " + a; }],
    [/^(.*) · Meeting$/, function (m, a) { return a + " · సమావేశం"; }]
  );
  var MIC_TE = { "Furniture": "ఫర్నిచర్", "Electrical": "ఎలక్ట్రికల్", "Cleaning": "శుభ్రపరచడం", "Plumbing": "ప్లంబింగ్", "Garden": "తోట", "Security": "భద్రత", "Festival / decoration": "పండుగ / అలంకరణ",
    "Kitchen / utensils": "వంటగది / పాత్రలు", "Tools": "పనిముట్లు", "Stationery": "స్టేషనరీ", "Other": "ఇతరాలు" };
  PAT.push(
    [/^🏗 Major assets · (\d+)$/, function (m, a) { return "🏗 పెద్ద ఆస్తులు · " + a; }],
    [/^🪑 Minor items · (\d+)$/, function (m, a) { return "🪑 చిన్న వస్తువులు · " + a; }],
    [/^(\S+) (Furniture|Electrical|Cleaning|Plumbing|Garden|Security|Festival \/ decoration|Kitchen \/ utensils|Tools|Stationery|Other) · (\d+)$/, function (m, e, c, n) { return e + " " + MIC_TE[c] + " · " + n; }],
    [/^Minor items: (.+)$/, function (m, a) { return "చిన్న వస్తువులు: " + (MIC_TE[a] || a); }]
  );

  PAT.push(
    [/^Waiting for an answer · (\d+)$/, function (m, a) { return "సమాధానం కోసం ఎదురుచూస్తున్నవి · " + a; }],
    [/^(\d+) min waiting$/, function (m, a) { return a + " నిమిషాలుగా ఎదురుచూస్తున్నారు"; }],
    [/^Call Flat (.+)$/, function (m, a) { return "ఫ్లాట్ " + a + " కు కాల్"; }],
    [/^Paid leaves left in (\d{4})$/, function (m, a) { return a + " లో మిగిలిన జీతం సెలవులు"; }],
    [/^Record leave for (.+)$/, function (m, a) { return a + " కు సెలవు నమోదు"; }],
    [/^(\d+) waiting$/, function (m, a) { return a + " ఎదురుచూస్తున్నాయి"; }],
    [/^All flats \((\d+)\)$/, function (m, a) { return "అన్ని ఫ్లాట్లు (" + a + ")"; }],
    [/^Always allowed · (\d+)$/, function (m, a) { return "ఎల్లప్పుడూ అనుమతి · " + a; }]
  );
  for (var k2 in TE2) if (Object.prototype.hasOwnProperty.call(TE2, k2)) TE[k2] = TE2[k2];
  PAT.push(
    [/^(\d+) days? late$/, function (m, a) { return a + " రోజులు ఆలస్యం"; }],
    [/^In (\d+) days?$/, function (m, a) { return a + " రోజుల్లో"; }],
    [/^(\d+) days left$/, function (m, a) { return a + " రోజులు మిగిలాయి"; }],
    [/^(\d+) overdue$/, function (m, a) { return a + " గడువు దాటాయి"; }],
    [/^(\d+) this week$/, function (m, a) { return "ఈ వారం " + a; }],
    [/^Open action items · (\d+)$/, function (m, a) { return "పూర్తి కాని పనులు · " + a; }],
    [/^Inside now · (\d+)$/, function (m, a) { return "ఇప్పుడు లోపల · " + a; }],
    [/^(All|Open|In progress|Resolved) · (\d+)$/, function (m, a, b) { return ({ All: "అన్నీ", Open: "తెరిచి ఉన్నవి", "In progress": "జరుగుతున్నవి", Resolved: "పరిష్కరించినవి" })[a] + " · " + b; }],
    [/^Service history \((\d+)\)$/, function (m, a) { return "సర్వీస్ చరిత్ర (" + a + ")"; }],
    [/^Mark done: (.*)$/, function (m, a) { return "పూర్తయింది: " + a; }],
    [/^Show all (\d+) earlier meetings$/, function (m, a) { return "గత " + a + " సమావేశాలన్నీ చూపించు"; }],
    [/^(\d+) of (\d+) flats: (.*)$/, function (m, a, b, c) { return b + " ఫ్లాట్లలో " + a + ": " + c; }]
  );

  /* ---------- the translator (also fixes anything the app draws later, like pages, pop-ups and messages) ---------- */
  var has = Object.prototype.hasOwnProperty;
  function tr(s) {
    var k = s.trim();
    if (!k) return s;
    var v = has.call(TE, k) ? TE[k] : null;
    if (v === null) {
      for (var i = 0; i < PAT.length; i++) {
        var m = PAT[i][0].exec(k);
        if (m) { v = PAT[i][1].apply(null, m); break; }
      }
    }
    if (v === null || v === undefined) return s;
    return s.replace(k, function () { return v; });
  }
  window.KK_TR = tr;
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, CODE: 1, PRE: 1 };
  function doText(n) {
    var p = n.parentNode, t = n.nodeValue;
    if (!p || SKIP[p.nodeName] || !t || t.length > 700) return;
    var r = tr(t);
    if (r === t) return;
    /* a drop-down choice without its own value uses its text as the value: freeze the English one first */
    if (p.nodeName === "OPTION" && !p.hasAttribute("value")) p.setAttribute("value", t.replace(/\s+/g, " ").trim());
    n.nodeValue = r;
  }
  var ATTR = ["placeholder", "title", "aria-label"];
  function doEl(el) {
    for (var i = 0; i < ATTR.length; i++) {
      var v = el.getAttribute(ATTR[i]);
      if (v) { var r = tr(v); if (r !== v) el.setAttribute(ATTR[i], r); }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1) return;
    doEl(root);
    if (root.nodeName === "SCRIPT" || root.nodeName === "STYLE") return;
    var w = document.createTreeWalker(root, 1 | 4), n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else doEl(n); }
  }
  var mo = new MutationObserver(function (list) {
    var todo = [];
    list.forEach(function (m) {
      if (m.type === "characterData") todo.push(m.target);
      else for (var i = 0; i < m.addedNodes.length; i++) todo.push(m.addedNodes[i]);
    });
    mo.disconnect();
    try { todo.forEach(function (n) { if (n.isConnected) walk(n); }); } finally { watch(); }
  });
  function watch() { mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true }); }
  watch();
  function first() { try { mo.disconnect(); walk(document.body); } finally { watch(); } }
  if (document.body) first(); else document.addEventListener("DOMContentLoaded", first);

  /* pop-up questions ("Delete this file?") are not part of the page, so translate them here */
  var c0 = window.confirm, a0 = window.alert;
  window.confirm = function (m) { return c0.call(window, tr(String(m))); };
  window.alert = function (m) { return a0.call(window, tr(String(m))); };
})();
