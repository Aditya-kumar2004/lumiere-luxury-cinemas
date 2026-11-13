const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

/**
 * Generates a luxury, high-resolution PDF Cinema Pass with Logo and Scannable QR Code
 * @param {Object} booking - Booking details
 * @returns {Promise<Buffer>} - Buffer of the generated PDF
 */
async function generateTicketPdf(booking) {
  const bookingCode = booking.booking_code || booking.bookingCode || "CP-94821";
  const movieTitle = booking.movie_title || booking.movieTitle || "Blockbuster Movie";
  const cinemaName = booking.cinema_name || booking.cinemaName || "LUMIÈRE Grand — IMAX Laser";
  const showTime = booking.show_time || booking.showTime || "7:30 PM";
  const rawDate = booking.show_date || booking.showDate || new Date();
  const showDate = new Date(rawDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const seats = Array.isArray(booking.seats) ? booking.seats.join(", ") : booking.seats || "G1";
  const totalAmount = booking.total_amount || booking.totalAmount || "0.00";
  const userName = booking.user_name || booking.userName || "Valued Guest";
  const userEmail = booking.user_email || booking.userEmail || "";

  // The QR code contains verification link / booking payload for gate staff scanner
  const qrPayload = JSON.stringify({
    code: bookingCode,
    movie: movieTitle,
    cinema: cinemaName,
    time: showTime,
    date: showDate,
    seats: Array.isArray(booking.seats) ? booking.seats : [booking.seats],
    user: userName,
    status: "CONFIRMED",
  });

  // Generate crisp QR code buffer (Black on White for optimal laser/phone camera scanning)
  const qrBuffer = await QRCode.toBuffer(bookingCode, {
    width: 140,
    margin: 1,
    color: {
      dark: "#0b0d13",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [500, 700], // Professional ticket pass dimensions
        margin: 20,
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // 1. Deep Cinema Dark Background
      doc.rect(0, 0, 500, 700).fill("#0c0e14");

      // 2. Double Luxury Gold Border
      doc.rect(15, 15, 470, 670).lineWidth(1.5).stroke("#d4af37");
      doc.rect(19, 19, 462, 662).lineWidth(0.5).stroke("rgba(212, 175, 55, 0.4)");

      // 3. Header Container with Gradient effect
      doc.rect(20, 20, 460, 95).fill("#141824");

      // Draw Gold Emblem Diamond (Geometric Logo)
      doc.save();
      doc.translate(250, 45);
      doc.lineWidth(1.5).strokeColor("#f59e0b");
      // Outer Diamond
      doc.polygon([0, -16], [16, 0], [0, 16], [-16, 0]).stroke();
      // Inner Diamond
      doc.lineWidth(0.8).strokeColor("#fde047");
      doc.polygon([0, -10], [10, 0], [0, 10], [-10, 0]).stroke();
      doc.restore();

      // Brand Typography
      doc.fillColor("#f59e0b").font("Helvetica-Bold").fontSize(20).text("L U M I È R E", 20, 68, {
        align: "center",
        characterSpacing: 4,
      });
      doc
        .fillColor("#94a3b8")
        .font("Helvetica")
        .fontSize(8.5)
        .text("PREMIER LUXURY CINEMAS · OFFICIAL ADMISSION PASS", 20, 93, {
          align: "center",
          characterSpacing: 1.5,
        });

      // 4. Perforated Gold Divider Line
      doc.save();
      doc.dash(4, { space: 3 });
      doc.lineWidth(1).strokeColor("rgba(212, 175, 55, 0.5)");
      doc.moveTo(25, 125).lineTo(475, 125).stroke();
      doc.undash();
      doc.restore();

      // 5. Booking Reference Banner
      doc.rect(35, 135, 430, 46).fill("#191e2b");
      doc.rect(35, 135, 430, 46).lineWidth(1).stroke("rgba(212, 175, 55, 0.3)");

      doc.fillColor("#f59e0b").font("Helvetica-Bold").fontSize(8.5).text("BOOKING REFERENCE", 50, 144);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(18).text(bookingCode, 50, 156, {
        characterSpacing: 2,
      });

      doc.fillColor("#94a3b8").font("Helvetica-Bold").fontSize(8.5).text("STATUS", 350, 144, { align: "right", width: 100 });
      doc.fillColor("#22c55e").font("Helvetica-Bold").fontSize(12).text("✓ CONFIRMED", 350, 158, { align: "right", width: 100 });

      // 6. Main Ticket Information Box
      doc.rect(35, 195, 270, 275).fill("#131620");
      doc.rect(35, 195, 270, 275).lineWidth(0.8).stroke("#2e3440");

      let curY = 208;

      // Movie
      doc.fillColor("#94a3b8").font("Helvetica").fontSize(8).text("FEATURE FILM", 50, curY);
      curY += 12;
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(15).text(movieTitle.toUpperCase(), 50, curY, { width: 240 });
      curY += 28;

      // Cinema
      doc.fillColor("#94a3b8").font("Helvetica").fontSize(8).text("CINEMA HALL & SCREEN", 50, curY);
      curY += 12;
      doc.fillColor("#f59e0b").font("Helvetica-Bold").fontSize(11).text(cinemaName, 50, curY, { width: 240 });
      curY += 25;

      // Date & Time
      doc.fillColor("#94a3b8").font("Helvetica").fontSize(8).text("SHOWTIME", 50, curY);
      curY += 12;
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11).text(`${showDate} · ${showTime}`, 50, curY);
      curY += 25;

      // Seats
      doc.fillColor("#94a3b8").font("Helvetica").fontSize(8).text("SEATS ALLOCATED", 50, curY);
      curY += 12;
      doc.fillColor("#4ade80").font("Helvetica-Bold").fontSize(14).text(seats, 50, curY);
      curY += 25;

      // Guest Name
      doc.fillColor("#94a3b8").font("Helvetica").fontSize(8).text("GUEST", 50, curY);
      curY += 12;
      doc.fillColor("#ffffff").font("Helvetica").fontSize(10).text(userName, 50, curY);
      curY += 25;

      // Amount
      doc.fillColor("#94a3b8").font("Helvetica").fontSize(8).text("TOTAL PAID", 50, curY);
      curY += 12;
      doc.fillColor("#f59e0b").font("Helvetica-Bold").fontSize(13).text(`₹${totalAmount}`, 50, curY);

      // 7. QR Code Panel (Right Side)
      doc.rect(320, 195, 145, 275).fill("#131620");
      doc.rect(320, 195, 145, 275).lineWidth(0.8).stroke("#2e3440");

      doc.fillColor("#f59e0b").font("Helvetica-Bold").fontSize(8).text("ENTRY SCANNER", 325, 208, {
        align: "center",
        width: 135,
      });

      // White Badge Card around QR Code
      doc.rect(332, 226, 120, 120).fill("#ffffff");
      doc.image(qrBuffer, 337, 231, { width: 110, height: 110 });

      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9).text("GATE PASS", 325, 360, {
        align: "center",
        width: 135,
      });

      doc.fillColor("#94a3b8").font("Helvetica").fontSize(7.5).text("Present this QR code\nat cinema entrance for\ninstant gate verification.", 325, 375, {
        align: "center",
        width: 135,
        lineGap: 2,
      });

      doc.fillColor("#64748b").font("Helvetica").fontSize(6.5).text(`ID: ${bookingCode}`, 325, 435, {
        align: "center",
        width: 135,
      });

      // 8. Important Instructions Section
      doc.rect(35, 485, 430, 105).fill("#10131c");
      doc.rect(35, 485, 430, 105).lineWidth(0.5).stroke("rgba(212, 175, 55, 0.2)");

      doc.fillColor("#f59e0b").font("Helvetica-Bold").fontSize(8.5).text("IMPORTANT ADMISSION GUIDELINES", 48, 498);

      doc
        .fillColor("#94a3b8")
        .font("Helvetica")
        .fontSize(7.5)
        .text("• Entry Gate: Please arrive 15 minutes before the scheduled showtime for smooth verification.", 48, 515)
        .text("• Digital Ticket: You can present this PDF on your smartphone or carry a printed copy.", 48, 528)
        .text("• VIP Service: Gourmet food and beverages can be ordered directly to your recliner seats.", 48, 541)
        .text("• Single Entry: This ticket QR code will be invalidated once scanned at the cinema gate.", 48, 554)
        .text("• Support Helpline: For cancellations or assistance, visit www.lumierecinemas.com or call 1800-LUMIERE.", 48, 567);

      // 9. Footer
      doc
        .fillColor("#475569")
        .font("Helvetica")
        .fontSize(7.5)
        .text("© 2026 LUMIÈRE Premier Luxury Cinemas. All rights reserved. System Generated Official Ticket.", 20, 620, {
          align: "center",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateTicketPdf,
};

