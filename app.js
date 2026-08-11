// NPTEL SWAYAM Fee Payment Portal Controller
document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // 1. Mock Database
    // -------------------------------------------------------------
    const defaultStudents = {
        "23CB062": {
            rollNumber: "23CB062",
            name: "VISHVAA P",
            fatherName: "PARTHIPAN R",
            email: "23CB062@nptel-swayam.ac.in",
            mobile: "9363080459",
            dob: "2006-04-06",
            course: "NPTEL SWAYAM Online Courses",
            specialization: "Computer Science & Business Systems (CS&BS)",
            fees: [
                { id: "fee_1", status: "Success", type: "NPTEL EXAM FEE - CLOUD COMPUTING", period: "JUL-DEC 2025", amount: 2800, lastDate: "15/12/2025", lateFee: 0, totalFee: 2800 },
                { id: "fee_2", status: "Success", type: "NPTEL EXAM FEE - MACHINE LEARNING", period: "JAN-JUN 2025", amount: 2800, lastDate: "15/06/2025", lateFee: 0, totalFee: 2800 },
                { id: "fee_3", status: "Success", type: "NPTEL EXAM FEE - DATABASE SYSTEMS", period: "JUL-DEC 2024", amount: 2800, lastDate: "15/12/2024", lateFee: 0, totalFee: 2800 },
                { id: "fee_4", status: "Success", type: "NPTEL EXAM FEE - PROGRAMMING IN C++", period: "JAN-JUN 2024", amount: 2800, lastDate: "15/06/2024", lateFee: 0, totalFee: 2800 },
                
                // Unpaid Items for interactive testing (also 2800 every)
                { id: "fee_5", status: "Unpaid", type: "NPTEL EXAM FEE - ARTIFICIAL INTELLIGENCE", period: "JAN-JUN 2026", amount: 2800, lastDate: "25/08/2026", lateFee: 0, totalFee: 2800 },
                { id: "fee_6", status: "Unpaid", type: "NPTEL EXAM FEE - WEB DEVELOPMENT", period: "JULY-DEC 2026", amount: 2800, lastDate: "25/10/2026", lateFee: 0, totalFee: 2800 }
            ]
        },
        "23CS101": {
            rollNumber: "23CS101",
            name: "ANUSHRI S",
            fatherName: "SUBRAMANIAN K",
            email: "23cs101@nptel-swayam.ac.in",
            mobile: "9876543210",
            dob: "2005-09-12",
            course: "NPTEL SWAYAM Online Courses",
            specialization: "Computer Science & Engineering (CSE)",
            fees: [
                { id: "fee_cs1", status: "Success", type: "NPTEL EXAM FEE - DATABASE SYSTEMS", period: "JAN-JUN 2024", amount: 2800, lastDate: "15/06/2024", lateFee: 0, totalFee: 2800 },
                { id: "fee_cs2", status: "Unpaid", type: "NPTEL EXAM FEE - SOFTWARE ENGINEERING", period: "JULY-DEC 2026", amount: 2800, lastDate: "25/08/2026", lateFee: 0, totalFee: 2800 }
            ]
        }
    };

    const defaultTransactions = [
        {
            txnId: "SWY82736184",
            rollNumber: "23CB062",
            studentName: "VISHVAA P",
            date: "15/02/2026, 10:30:00 AM",
            amount: 2800,
            mode: "Credit Card",
            items: [{ type: "NPTEL EXAM FEE - CLOUD COMPUTING", amount: 2800 }]
        },
        {
            txnId: "SWY61928473",
            rollNumber: "23CB062",
            studentName: "VISHVAA P",
            date: "15/08/2025, 02:45:00 PM",
            amount: 2800,
            mode: "Net Banking",
            items: [{ type: "NPTEL EXAM FEE - MACHINE LEARNING", amount: 2800 }]
        },
        {
            txnId: "SWY39281746",
            rollNumber: "23CB062",
            studentName: "VISHVAA P",
            date: "15/02/2025, 09:15:00 AM",
            amount: 2800,
            mode: "UPI",
            items: [{ type: "NPTEL EXAM FEE - DATABASE SYSTEMS", amount: 2800 }]
        },
        {
            txnId: "SWY10283749",
            rollNumber: "23CB062",
            studentName: "VISHVAA P",
            date: "15/08/2024, 04:20:00 PM",
            amount: 2800,
            mode: "Debit Card",
            items: [{ type: "NPTEL EXAM FEE - PROGRAMMING IN C++", amount: 2800 }]
        }
    ];

    // Initialize LocalStorage if empty
    if (!localStorage.getItem("nptel_students_v3")) {
        localStorage.setItem("nptel_students_v3", JSON.stringify(defaultStudents));
    }

    if (!localStorage.getItem("nptel_transactions_v3")) {
        localStorage.setItem("nptel_transactions_v3", JSON.stringify(defaultTransactions));
    }

    // -------------------------------------------------------------
    // 2. State & Variables
    // -------------------------------------------------------------
    let currentStudent = null;
    let currentFilter = "All"; // "All", "Unpaid", "Paid"
    let selectedFees = new Set();

    // -------------------------------------------------------------
    // 3. DOM Elements
    // -------------------------------------------------------------
    // Navigation Tabs
    const formTabBtn = document.getElementById("formTabBtn");
    const historyTabBtn = document.getElementById("historyTabBtn");
    const formPanel = document.getElementById("formPanel");
    const historyPanel = document.getElementById("historyPanel");

    // Login Form Elements
    const loginFormContainer = document.getElementById("loginFormContainer");
    const loginForm = document.getElementById("loginForm");
    const rollNoInput = document.getElementById("rollNo");
    const dobInput = document.getElementById("dob");
    const loginError = document.getElementById("loginError");

    // Student Dashboard & Table
    const studentDashboard = document.getElementById("studentDashboard");
    const studentRoll = document.getElementById("studentRoll");
    const studentName = document.getElementById("studentName");
    const studentFatherName = document.getElementById("studentFatherName");
    const studentEmail = document.getElementById("studentEmail");
    const studentMobile = document.getElementById("studentMobile");
    const studentDob = document.getElementById("studentDob");
    const studentCourse = document.getElementById("studentCourse");
    const studentSpec = document.getElementById("studentSpec");

    // Filter Buttons
    const filterAll = document.getElementById("filterAll");
    const filterPaid = document.getElementById("filterPaid");
    const filterUnpaid = document.getElementById("filterUnpaid");

    // Table elements
    const feesTableBody = document.getElementById("feesTableBody");
    const totalAmountBox = document.getElementById("totalAmountBox");
    const payNowBtn = document.getElementById("payNowBtn");

    // Modals
    const checkoutModal = document.getElementById("checkoutModal");
    const receiptModal = document.getElementById("receiptModal");
    const modalTotalAmount = document.getElementById("modalTotalAmount");
    const checkoutClose = document.getElementById("checkoutClose");
    const receiptClose = document.getElementById("receiptClose");
    const paymentForm = document.getElementById("paymentForm");
    
    // Receipt Modal Contents
    const receiptRoll = document.getElementById("receiptRoll");
    const receiptName = document.getElementById("receiptName");
    const receiptTxn = document.getElementById("receiptTxn");
    const receiptDate = document.getElementById("receiptDate");
    const receiptMode = document.getElementById("receiptMode");
    const receiptItemsContainer = document.getElementById("receiptItemsContainer");
    const receiptTotal = document.getElementById("receiptTotal");
    const printReceiptBtn = document.getElementById("printReceiptBtn");

    // Transaction History Table
    const historyTableContainer = document.getElementById("historyTableContainer");
    const historyTableBody = document.getElementById("historyTableBody");
    const emptyHistoryMessage = document.getElementById("emptyHistoryMessage");

    // Loader
    const checkoutLoader = document.getElementById("checkoutLoader");
    const gatewayBody = document.getElementById("gatewayBody");

    // -------------------------------------------------------------
    // 4. Tab Navigation Logic
    // -------------------------------------------------------------
    formTabBtn.addEventListener("click", () => {
        switchTab("form");
    });

    historyTabBtn.addEventListener("click", () => {
        switchTab("history");
    });

    function switchTab(tab) {
        if (tab === "form") {
            formTabBtn.classList.add("active");
            historyTabBtn.classList.remove("active");
            formPanel.classList.add("active");
            historyPanel.classList.remove("active");
        } else {
            formTabBtn.classList.remove("active");
            historyTabBtn.classList.add("active");
            formPanel.classList.remove("active");
            historyPanel.classList.add("active");
            renderPaymentHistory();
        }
    }

    // -------------------------------------------------------------
    // 5. Verification / Login Handling
    // -------------------------------------------------------------
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const roll = rollNoInput.value.trim().toUpperCase();
        const dob = dobInput.value.trim();

        if (!roll || !dob) {
            showLoginError("Please fill in both Roll Number and DOB.");
            return;
        }

        const db = JSON.parse(localStorage.getItem("nptel_students_v3"));
        const student = db[roll];

        if (student && student.dob === dob) {
            loginError.style.display = "none";
            loadStudentDashboard(student);
        } else {
            showLoginError("Verification failed. Please check your Roll Number and Date of Birth.");
        }
    });

    function showLoginError(msg) {
        loginError.innerText = msg;
        loginError.style.display = "block";
        loginError.classList.add("shake-animation");
        setTimeout(() => {
            loginError.classList.remove("shake-animation");
        }, 500);
    }

    function loadStudentDashboard(student) {
        currentStudent = student;
        selectedFees.clear();

        // Populate fields
        studentRoll.innerText = student.rollNumber;
        studentName.innerText = student.name;
        studentFatherName.innerText = student.fatherName;
        studentEmail.value = student.email;
        studentMobile.value = student.mobile;
        studentDob.innerText = student.dob;
        studentCourse.innerText = student.course;
        studentSpec.innerText = student.specialization;

        // Display dashboard
        loginFormContainer.style.display = "none";
        studentDashboard.style.display = "block";

        // Render Table
        renderFeesTable();
        updatePayBar();
    }

    // -------------------------------------------------------------
    // 6. Rentering Fees & Filtering
    // -------------------------------------------------------------
    filterAll.addEventListener("click", () => setFilter("All"));
    filterPaid.addEventListener("click", () => setFilter("Paid"));
    filterUnpaid.addEventListener("click", () => setFilter("Unpaid"));

    function setFilter(filter) {
        currentFilter = filter;
        document.querySelectorAll(".filter-button").forEach(btn => btn.classList.remove("active"));
        
        if (filter === "All") filterAll.classList.add("active");
        if (filter === "Paid") filterPaid.classList.add("active");
        if (filter === "Unpaid") filterUnpaid.classList.add("active");

        renderFeesTable();
    }

    function renderFeesTable() {
        feesTableBody.innerHTML = "";
        
        if (!currentStudent) return;

        const filtered = currentStudent.fees.filter(fee => {
            if (currentFilter === "All") return true;
            if (currentFilter === "Paid") return fee.status === "Success";
            if (currentFilter === "Unpaid") return fee.status === "Unpaid";
        });

        if (filtered.length === 0) {
            const colspan = 8;
            feesTableBody.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center; padding: 30px; color: var(--text-muted);">No records found for current filter.</td></tr>`;
            return;
        }

        filtered.forEach(fee => {
            const tr = document.createElement("tr");

            // Status cell
            const tdStatus = document.createElement("td");
            let badgeClass = "unpaid";
            if (fee.status === "Success") badgeClass = "success";
            tdStatus.innerHTML = `<span class="status-badge ${badgeClass}">${fee.status}</span>`;

            // Fee Type
            const tdType = document.createElement("td");
            tdType.innerText = fee.type;

            // Period
            const tdPeriod = document.createElement("td");
            tdPeriod.innerText = fee.period;

            // Amount
            const tdAmount = document.createElement("td");
            tdAmount.innerText = fee.amount;

            // Last Date
            const tdDate = document.createElement("td");
            tdDate.innerText = fee.lastDate;

            // Late Fee
            const tdLate = document.createElement("td");
            tdLate.innerText = fee.lateFee;

            // Total Fee
            const tdTotal = document.createElement("td");
            tdTotal.innerText = fee.totalFee;

            // Action
            const tdAction = document.createElement("td");
            if (fee.status === "Unpaid") {
                const checkContainer = document.createElement("div");
                checkContainer.className = "checkbox-container";
                
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "custom-checkbox";
                checkbox.checked = selectedFees.has(fee.id);
                checkbox.addEventListener("change", (e) => {
                    if (e.target.checked) {
                        selectedFees.add(fee.id);
                    } else {
                        selectedFees.delete(fee.id);
                    }
                    updatePayBar();
                });
                checkContainer.appendChild(checkbox);
                tdAction.appendChild(checkContainer);
            } else {
                tdAction.style.textAlign = "center";
                tdAction.innerHTML = `<span style="color: #27ae60; font-weight: bold;">&#10004; Paid</span>`;
            }

            tr.appendChild(tdStatus);
            tr.appendChild(tdType);
            tr.appendChild(tdPeriod);
            tr.appendChild(tdAmount);
            tr.appendChild(tdDate);
            tr.appendChild(tdLate);
            tr.appendChild(tdTotal);
            tr.appendChild(tdAction);

            feesTableBody.appendChild(tr);
        });
    }

    function calculateTotal() {
        let total = 0;
        if (!currentStudent) return 0;
        
        currentStudent.fees.forEach(fee => {
            if (selectedFees.has(fee.id)) {
                total += fee.totalFee;
            }
        });
        return total;
    }

    function updatePayBar() {
        const total = calculateTotal();
        totalAmountBox.innerText = `INR ${total.toLocaleString()}`;
        
        if (total > 0) {
            payNowBtn.removeAttribute("disabled");
            payNowBtn.innerText = "Pay Now";
        } else {
            payNowBtn.setAttribute("disabled", "true");
            payNowBtn.innerText = "Fee collected"; // Displays this matching screenshot bottom state
        }
    }

    // -------------------------------------------------------------
    // 7. Mock Checkout & Payments
    // -------------------------------------------------------------
    payNowBtn.addEventListener("click", () => {
        const total = calculateTotal();
        if (total <= 0) return;

        // Open checkout modal
        modalTotalAmount.innerText = `INR ${total.toLocaleString()}`;
        checkoutModal.style.display = "flex";
        
        // Show gateway content and hide loading spinner initially
        gatewayBody.style.display = "block";
        checkoutLoader.style.display = "none";
    });

    checkoutClose.addEventListener("click", () => {
        checkoutModal.style.display = "none";
    });

    receiptClose.addEventListener("click", () => {
        receiptModal.style.display = "none";
    });

    // Payment Gateway Options Selection
    const payTabs = document.querySelectorAll(".pay-tab");
    const payOptions = document.querySelectorAll(".pay-option-content");

    payTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            payTabs.forEach(t => t.classList.remove("active"));
            payOptions.forEach(o => o.classList.remove("active"));

            tab.classList.add("active");
            const targetOption = tab.getAttribute("data-target");
            document.getElementById(targetOption).classList.add("active");
        });
    });

    // Handle Mock Checkout Form Submission
    paymentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Retrieve selected payment tab
        const activeTab = document.querySelector(".pay-tab.active").innerText;

        // Trigger Loading Spinner (Simulated Verification)
        gatewayBody.style.display = "none";
        checkoutLoader.style.display = "flex";

        setTimeout(() => {
            completeTransaction(activeTab);
        }, 2200);
    });

    /* =========================================================================
       INSTRUCTIONS: HOW TO INTEGRATE THE ACTUAL CASHFREE SDK
       =========================================================================
       To connect your live Cashfree account, you will need a backend server
       (Node.js, PHP, Python, Java, etc.) to securely create orders using Cashfree APIs.
       Do NOT make Cashfree PG API calls directly from the frontend, as it exposes 
       your Secret API Keys.

       Follow these steps to connect:

       STEP 1: Include the Cashfree SDK script in the <head> of index.html:
       <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>

       STEP 2: Initialize Cashfree at the top of your controller (app.js):
       const cashfree = Cashfree({
           mode: "sandbox" // Change to "production" when going live
       });

       STEP 3: Replace the submit event handler above with this async integration code:
       
       paymentForm.addEventListener("submit", async (e) => {
           e.preventDefault();
           
           const total = calculateTotal();
           
           try {
               // 1. Call your backend server to create a Cashfree order.
               // Your backend securely hits: POST https://sandbox.cashfree.com/pg/orders
               // with headers 'x-client-id' (App ID) and 'x-client-secret' (Secret Key)
               // and request body (order_amount, order_currency="INR", customer_details).
               const response = await fetch("/api/create-cashfree-order", {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                   body: JSON.stringify({
                       amount: total,
                       customer_id: currentStudent.rollNumber,
                       customer_email: studentEmail.value,
                       customer_phone: studentMobile.value
                   })
               });
               
               const orderData = await response.json();
               const paymentSessionId = orderData.payment_session_id; // Session ID from Cashfree API
               
               // 2. Launch Cashfree's checkout redirection/overlay
               const checkoutOptions = {
                   paymentSessionId: paymentSessionId,
                   redirectTarget: "_self" // Opens in current window
               };
               
               cashfree.checkout(checkoutOptions).then((result) => {
                   if (result.error) {
                       alert("Payment failed: " + result.error.message);
                   }
                   if (result.redirect) {
                       console.log("Redirected to Cashfree authorization portal.");
                   }
               });

           } catch (error) {
               console.error("Cashfree Checkout Error:", error);
               alert("Unable to initiate Cashfree payment. Verify server endpoints.");
           }
       });
       ========================================================================= */

    function completeTransaction(paymentMode) {
        const db = JSON.parse(localStorage.getItem("nptel_students_v3"));
        const student = db[currentStudent.rollNumber];
        
        const paidItems = [];
        let totalPaid = 0;

        // Update fee statuses to Success
        student.fees.forEach(fee => {
            if (selectedFees.has(fee.id)) {
                fee.status = "Success";
                paidItems.push(fee);
                totalPaid += fee.totalFee;
            }
        });

        // Save updated student in mock database
        db[currentStudent.rollNumber] = student;
        localStorage.setItem("nptel_students_v3", JSON.stringify(db));

        // Generate Transaction Record
        const txnId = "SWY" + Math.floor(10000000 + Math.random() * 90000000);
        const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        
        const transaction = {
            txnId: txnId,
            rollNumber: student.rollNumber,
            studentName: student.name,
            date: dateStr,
            amount: totalPaid,
            mode: paymentMode,
            items: paidItems.map(item => ({ type: item.type, amount: item.totalFee }))
        };

        // Save Transaction in local history
        const transactions = JSON.parse(localStorage.getItem("nptel_transactions_v3"));
        transactions.unshift(transaction);
        localStorage.setItem("nptel_transactions_v3", JSON.stringify(transactions));

        // Refresh State
        currentStudent = student;
        selectedFees.clear();

        // Close Checkout, Render Receipt
        checkoutModal.style.display = "none";
        showReceipt(transaction);
        
        // Refresh display
        renderFeesTable();
        updatePayBar();
    }

    function showReceipt(transaction) {
        receiptRoll.innerText = transaction.rollNumber;
        receiptName.innerText = transaction.studentName;
        receiptTxn.innerText = transaction.txnId;
        receiptDate.innerText = transaction.date;
        receiptMode.innerText = transaction.mode;

        // Load Receipt Items
        receiptItemsContainer.innerHTML = "";
        transaction.items.forEach(item => {
            const row = document.createElement("div");
            row.className = "receipt-row";
            row.innerHTML = `
                <span class="label">${item.type}</span>
                <span class="val">INR ${item.amount.toLocaleString()}</span>
            `;
            receiptItemsContainer.appendChild(row);
        });

        receiptTotal.innerText = `INR ${transaction.amount.toLocaleString()}`;
        receiptModal.style.display = "flex";
    }

    printReceiptBtn.addEventListener("click", () => {
        window.print();
    });

    // -------------------------------------------------------------
    // 8. Payment History Display
    // -------------------------------------------------------------
    function renderPaymentHistory() {
        historyTableBody.innerHTML = "";
        
        if (!currentStudent) {
            historyTableContainer.style.display = "none";
            emptyHistoryMessage.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-lock"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <p>Please verify your student identity on the "Form" tab first.</p>
            `;
            emptyHistoryMessage.style.display = "block";
            return;
        }

        const transactions = JSON.parse(localStorage.getItem("nptel_transactions_v3"));
        const studentTxns = transactions.filter(t => t.rollNumber === currentStudent.rollNumber);

        if (studentTxns.length === 0) {
            historyTableContainer.style.display = "none";
            emptyHistoryMessage.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-text"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <p>No transaction history found for this student.</p>
            `;
            emptyHistoryMessage.style.display = "block";
            return;
        }

        emptyHistoryMessage.style.display = "none";
        historyTableContainer.style.display = "block";

        studentTxns.forEach(txn => {
            const tr = document.createElement("tr");

            // Transaction ID
            const tdTxn = document.createElement("td");
            tdTxn.innerHTML = `<strong>${txn.txnId}</strong>`;

            // Date
            const tdDate = document.createElement("td");
            tdDate.innerText = txn.date;

            // Amount
            const tdAmount = document.createElement("td");
            tdAmount.innerHTML = `<span style="font-weight: 600; color: var(--accent-red)">INR ${txn.amount.toLocaleString()}</span>`;

            // Payment Mode
            const tdMode = document.createElement("td");
            tdMode.innerText = txn.mode;

            // View Receipt button
            const tdAction = document.createElement("td");
            const btn = document.createElement("button");
            btn.className = "btn-primary";
            btn.style.padding = "5px 12px";
            btn.style.fontSize = "11px";
            btn.innerText = "Receipt";
            btn.addEventListener("click", () => {
                showReceipt(txn);
            });
            tdAction.appendChild(btn);

            tr.appendChild(tdTxn);
            tr.appendChild(tdDate);
            tr.appendChild(tdAmount);
            tr.appendChild(tdMode);
            tr.appendChild(tdAction);

            historyTableBody.appendChild(tr);
        });
    }
});
