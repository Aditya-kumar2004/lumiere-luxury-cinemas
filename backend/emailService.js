const nodemailer = require("nodemailer");
require("dotenv").config();

// Function to create fresh transporter using smtp.gmail.com
function getTransporter() {
  require("dotenv").config();

  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: user,
      pass: pass,
    },
  });
}

// Function to generate an 8-digit OTP
function generate8DigitOtp() {
  const min = 10000000;
  const max = 99999999;
  const otpNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return String(otpNumber);
}

// HTML Email with Google-style card and 1-click verification link
function getLuxuryOtpEmailHtml(userName, otpCode, userEmail) {
  const formattedOtp = String(otpCode).trim();
  const digits = formattedOtp.split("");

  // Verification URL that auto-fills OTP on the website
  const verifyUrl = `http://localhost:8080/register?code=${formattedOtp}&email=${encodeURIComponent(userEmail || "")}`;

  // Build the digit boxes
  const digitBoxesHtml = digits
    .map(
      (d) =>
        `<td align="center" valign="middle" style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; width: 34px; height: 40px; font-family: Consolas, 'Courier New', monospace; font-size: 20px; font-weight: 700; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">${d}</td>`
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP for Email verification</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 10px 10px 30px 10px;">
      <tr>
        <td align="center">
          
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
            
            <!-- 1. GMAIL-STYLE "CODE REQUESTED" ACTION CARD -->
            <tr>
              <td style="padding-bottom: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f9; border-radius: 16px; overflow: hidden;">
                  <tr>
                    <td style="padding: 20px 24px;">
                      
                      <!-- Card Label -->
                      <div style="font-size: 13px; font-weight: 500; color: #444746; margin-bottom: 12px;">
                        Code requested
                      </div>

                      <!-- Individual Digits in White Rounded Boxes -->
                      <table border="0" cellspacing="5" cellpadding="0" style="margin-bottom: 12px;">
                        <tr>
                          ${digitBoxesHtml}
                        </tr>
                      </table>

                      <!-- Quick Double-Click Copy Code Box -->
                      <div style="font-size: 12px; color: #4b5563; margin-bottom: 14px;">
                        📋 <strong>Double-click code to copy:</strong> 
                        <span style="font-family: Consolas, 'Courier New', monospace; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px 10px; font-size: 16px; font-weight: 700; color: #0b57d0; user-select: all; display: inline-block;">
                          ${formattedOtp}
                        </span>
                      </div>

                      <!-- Blue 1-Click Auto-Fill & Verify Button -->
                      <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                        <tr>
                          <td align="center" style="background-color: #0b57d0; border-radius: 20px; padding: 9px 24px;">
                            <a href="${verifyUrl}" target="_blank" style="font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: inline-block;">
                              Auto-Fill & Verify Code &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Footer note -->
                      <div style="font-size: 11px; color: #747775;">
                        Valid for 10 minutes &bull; Click button above to open website with code filled
                      </div>

                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- 2. MAIN BRANDED CONTENT CARD -->
            <tr>
              <td>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);">
                  
                  <!-- HEADER BANNER -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #09090b 0%, #18181b 60%, #27272a 100%); padding: 28px 32px; border-bottom: 3px solid #d9a441;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="left" valign="middle">
                            <div style="font-size: 24px; font-weight: 800; color: #d9a441; letter-spacing: 4px; text-transform: uppercase;">
                              LUMIÈRE
                            </div>
                            <div style="font-size: 10px; color: #e4e4e7; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
                              PREMIER LUXURY CINEMAS
                            </div>
                          </td>
                          <td align="right" valign="middle">
                            <div style="display: inline-block; background-color: rgba(217, 164, 65, 0.15); border: 1px solid #d9a441; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: 700; color: #fbbf24; letter-spacing: 1px; text-transform: uppercase;">
                              VIP ACCESS
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- BODY TEXT (Matches Accenture Reference) -->
                  <tr>
                    <td style="padding: 32px 32px 24px 32px; font-size: 15px; line-height: 1.6; color: #374151;">
                      
                      <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827;">
                        Hi ${userName || "Guest"},
                      </p>

                      <p style="margin: 0 0 16px 0; font-size: 15px; color: #374151;">
                        Thank you for showing interest in <strong>LUMIÈRE Cinemas</strong>.
                      </p>

                      <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151;">
                        Please use the following One Time Password to verify your login id and create your profile:
                      </p>

                      <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: bold; color: #111827;">
                        OTP: ${formattedOtp}
                      </p>

                      <p style="margin: 0 0 16px 0; font-size: 14px; color: #4b5563;">
                        For any queries, please reach out through live chat or helpline on our portal.
                      </p>

                      <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563;">
                        Wish you best!
                      </p>

                      <p style="margin: 0 0 4px 0; font-size: 14px; color: #111827; font-weight: 600;">
                        Regards,
                      </p>
                      <p style="margin: 0 0 25px 0; font-size: 14px; color: #d97706; font-weight: 700;">
                        LUMIÈRE Cinemas Team
                      </p>

                      <!-- DIVIDER LINE -->
                      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0 20px 0;" />

                      <!-- DISCLAIMER -->
                      <p style="margin: 0 0 10px 0; font-size: 11px; color: #9ca3af; line-height: 1.6;">
                        Please note, that LUMIÈRE Cinemas will never ask for your password or OTP over phone or email. Do not share this OTP with anyone.
                      </p>

                      <p style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.6;">
                        This is an automated system email. If you did not request this OTP, you can safely ignore this message.
                      </p>

                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td align="center" style="padding: 16px 20px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af;">
                      &copy; 2026 LUMIÈRE CINEMAS. All rights reserved. Bandra West, Mumbai.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}

// Function to send the OTP email
async function sendOtpEmail(userEmail, userName, otpCode) {
  require("dotenv").config();

  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || "").trim();

  // If email credentials are not configured, print to terminal
  if (!user || !pass || user === "your_email@gmail.com") {
    console.log("\n-------------------------------------------");
    console.log("✉️  LUMIÈRE VERIFICATION CODE (TEST MODE)");
    console.log("To:", userEmail);
    console.log("Customer:", userName);
    console.log("8-Digit Code: >>> " + otpCode + " <<<");
    console.log("Expires In: 10 Minutes");
    console.log("-------------------------------------------\n");
    return { success: true, mode: "test" };
  }

  // Real Email Sending
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"LUMIÈRE Cinemas" <${user}>`,
      to: userEmail,
      subject: "OTP for Email verification",
      text: `Hi ${userName || "Guest"},\n\nThank you for showing interest in our process.\nPlease use the following One Time Password to verify your login id and create your profile:\n\nOTP: ${otpCode}\n\nFor any queries, please reach out through live chat or helpline on our portal.\n\nWish you best!\n\nRegards,\nLUMIÈRE Cinemas Team`,
      html: getLuxuryOtpEmailHtml(userName, otpCode, userEmail),
    };

    console.log(`📤 Sending OTP email to ${userEmail} via ${user}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${userEmail}! Message ID: ${info.messageId}`);
    return { success: true, mode: "real", messageId: info.messageId };
  } catch (error) {
    console.error("❌ Gmail SMTP Error:", error.message);
    console.log(`👉 Fallback OTP for testing: >>> ${otpCode} <<<`);
    return { success: false, error: error.message };
  }
}

const { generateTicketPdf } = require("./ticketPdfService");

// Function to send Booking Confirmation Email with PDF Ticket Attachment
async function sendBookingEmail(booking) {
  require("dotenv").config();
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || "").trim();

  const recipientEmail = booking.user_email || booking.userEmail;
  const bookingCode = booking.booking_code || booking.bookingCode || "CP-" + Math.floor(10000 + Math.random() * 90000);
  const movieTitle = booking.movie_title || booking.movieTitle || "Movie";
  const cinemaName = booking.cinema_name || booking.cinemaName || "LUMIÈRE Cinemas";
  const rawDate = booking.show_date || booking.showDate || new Date();
  const showDate = new Date(rawDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const showTime = booking.show_time || booking.showTime || "7:30 PM";
  const seats = Array.isArray(booking.seats) ? booking.seats.join(", ") : booking.seats || "G1";
  const totalAmount = booking.total_amount || booking.totalAmount || "0.00";
  const userName = booking.user_name || booking.userName || "Valued Guest";

  // Generate the professional PDF pass with Logo and QR code
  let pdfBuffer = null;
  try {
    pdfBuffer = await generateTicketPdf({
      bookingCode,
      movieTitle,
      cinemaName,
      showDate,
      showTime,
      seats,
      totalAmount,
      userName,
      userEmail: recipientEmail,
    });
  } catch (pdfErr) {
    console.error("❌ PDF Generation Error:", pdfErr.message);
  }

  if (!user || !pass || user === "your_email@gmail.com") {
    console.log("\n-------------------------------------------");
    console.log("🎟️ LUMIÈRE TICKET CONFIRMED (LOG MODE)");
    console.log("To:", recipientEmail);
    console.log("Booking Code:", bookingCode);
    console.log("Movie:", movieTitle);
    console.log("Seats:", seats);
    console.log("Total: ₹" + totalAmount);
    console.log("PDF Generated:", pdfBuffer ? `${pdfBuffer.length} bytes` : "No");
    console.log("-------------------------------------------\n");
    return { success: true, mode: "test" };
  }

  try {
    const transporter = getTransporter();

    // Clean, professional email without complex layout
    const simpleEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #1e293b; line-height: 1.6; max-width: 600px; padding: 20px;">
        <h2 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">🎬 Booking Confirmed — LUMIÈRE Cinemas</h2>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Thank you for choosing LUMIÈRE Premier Luxury Cinemas. Your booking for <strong>${movieTitle}</strong> has been successfully confirmed.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Booking Reference:</strong> <span style="font-size: 16px; color: #b45309; font-weight: bold; font-family: monospace;">${bookingCode}</span></p>
          <p style="margin: 4px 0;"><strong>Movie:</strong> ${movieTitle}</p>
          <p style="margin: 4px 0;"><strong>Cinema Hall:</strong> ${cinemaName}</p>
          <p style="margin: 4px 0;"><strong>Showtime:</strong> ${showDate} · ${showTime}</p>
          <p style="margin: 4px 0;"><strong>Seats:</strong> <span style="color: #15803d; font-weight: bold;">${seats}</span></p>
          <p style="margin: 4px 0;"><strong>Total Paid:</strong> ₹${totalAmount}</p>
        </div>

        <p>📎 <strong>Your Official Ticket Pass with Scannable Gate QR Code is attached to this email as a PDF.</strong></p>
        <p>You can download and open the attached PDF on your phone or print it. Present the QR code on the PDF at the cinema entrance for direct verification by our staff.</p>

        <p style="margin-top: 32px; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          Please arrive 15 minutes before showtime. Food and beverages can be ordered directly to your recliner seats.<br><br>
          Warm regards,<br>
          <strong>LUMIÈRE Luxury Cinemas Team</strong><br>
          <span style="color: #94a3b8;">www.lumierecinemas.com | 1800-LUMIERE</span>
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"LUMIÈRE Cinemas" <${user}>`,
      to: recipientEmail,
      subject: `🎬 Booking Confirmed: ${movieTitle} [${bookingCode}]`,
      html: simpleEmailHtml,
      attachments: pdfBuffer
        ? [
            {
              filename: `Lumiere-Ticket-${bookingCode}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ]
        : [],
    };

    console.log(`📤 Sending Booking confirmation email with PDF to ${recipientEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Ticket Email sent to ${recipientEmail}! Message ID: ${info.messageId}`);
    return { success: true, mode: "real", messageId: info.messageId };
  } catch (error) {
    console.error("❌ Ticket Email Error:", error.message);
    return { success: false, error: error.message };
  }
}

// Test connection on module load
function checkEmailConnection() {
  require("dotenv").config();
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || "").trim();

  if (user && pass && user !== "your_email@gmail.com") {
    const transporter = getTransporter();
    transporter.verify(function (error, success) {
      if (error) {
        console.error("❌ Gmail Credentials Check Failed:", error.message);
      } else {
        console.log(`✅ Gmail SMTP is READY! Sending from: ${user}`);
      }
    });
  }
}

// Run connection check
checkEmailConnection();

module.exports = {
  generate8DigitOtp,
  sendOtpEmail,
  sendBookingEmail,
  checkEmailConnection,
};
