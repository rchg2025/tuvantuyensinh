import nodemailer from 'nodemailer';
import prisma from './prisma';

export async function getMailer() {
  const configs = await prisma.systemConfig.findMany({
    where: {
      key: { in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_SENDER_NAME', 'site_title'] }
    }
  });

  const configMap = configs.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const host = configMap['SMTP_HOST'];
  const port = parseInt(configMap['SMTP_PORT'] || '465');
  const user = configMap['SMTP_USER'];
  const pass = configMap['SMTP_PASS'];
  const senderName = configMap['SMTP_SENDER_NAME'];
  const siteTitle = configMap['site_title'] || 'Hệ thống tư vấn tuyển sinh';
  const finalSenderName = senderName ? senderName : siteTitle;
  const from = `"${finalSenderName}" <${user}>`;

  if (!host || !user || !pass) {
    console.warn("SMTP settings are missing. Mail will not be sent.");
    return null;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, 
    auth: { user, pass }
  });

  return { transporter, from };
}

const styles = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
  .header { background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); padding: 30px 40px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
  .content { padding: 40px; color: #334155; line-height: 1.6; font-size: 16px; }
  .content h2 { color: #1e293b; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 25px; }
  .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; }
  .info-row { margin-bottom: 15px; }
  .info-row:last-child { margin-bottom: 0; }
  .info-label { font-weight: 600; color: #64748b; font-size: 14px; margin-bottom: 6px; display: block; }
  .info-value { color: #0f172a; font-weight: 500; font-size: 16px; word-break: break-word; display: block; margin-left: 10px; }
  .footer { background-color: #f1f5f9; padding: 25px 40px; text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
  .button-container { text-align: center; margin-top: 35px; }
  .button { display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-size: 14px; transition: background-color 0.2s; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); }
  .button:hover { background-color: #1d4ed8; }
  .status-badge { display: inline-block; padding: 6px 16px; background-color: #dcfce7; color: #0f5132; border-radius: 20px; font-weight: 600; font-size: 14px; border: 1px solid #bbf7d0; margin-bottom: 20px; }
  .reply-box { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin-top: 25px; border-radius: 0 12px 12px 0; }
  .reply-label { color: #166534; font-weight: 700; margin-bottom: 8px; display: block; font-size: 15px; }
  .reply-content { color: #14532d; white-space: pre-wrap; margin: 0; font-style: italic; }
`;

export async function sendEmail({ to, subject, html }: { to: string | string[], subject: string, html: string }) {
  const mailer = await getMailer();
  if (!mailer) return false;
  
  let toList = Array.isArray(to) ? [...to] : [to];
  const bccList: string[] = [];
  
  if (toList.includes('nguyenluyen@nsg.edu.vn')) {
    toList = toList.filter(email => email !== 'nguyenluyen@nsg.edu.vn');
    bccList.push('nguyenluyen@nsg.edu.vn');
  }

  const mailOptions: any = {
    from: mailer.from,
    subject,
    html
  };

  if (toList.length > 0) mailOptions.to = toList;
  if (bccList.length > 0) mailOptions.bcc = bccList;

  // Nếu không còn ai ở To (chỉ gửi cho nguyenluyen qua bcc), cần 1 địa chỉ To hợp lệ (thường tự gửi cho chính mình)
  if (toList.length === 0 && bccList.length > 0) {
    mailOptions.to = mailer.from;
  }
  
  try {
    await mailer.transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Lỗi gửi mail: ", error);
    return false;
  }
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://ts26.nsg.edu.vn';
}

export async function notifyNewConsultation(data: { name: string, phone: string, email?: string | null, program?: string | null, notes?: string | null }) {
  const adminEmails = await getAdminAndCVDEmails();
  if (adminEmails.length === 0) return;

  const html = `
    <html>
      <head>
        <style>${styles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📥 Có lượt đăng ký tư vấn mới</h1>
          </div>
          <div class="content">
            <h2>Chi tiết thông tin đăng ký</h2>
            <p>Hệ thống vừa nhận được một yêu cầu tư vấn tuyển sinh mới từ Học viên:</p>
            <div class="info-box">
              <div class="info-row">
                <div class="info-label">Họ và tên:</div>
                <div class="info-value">${data.name}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Số điện thoại:</div>
                <div class="info-value" style="color: #2563eb; font-weight: 700;">${data.phone}</div>
              </div>
              ${data.email ? `
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value"><a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a></div>
              </div>` : ''}
              ${data.program ? `
              <div class="info-row">
                <div class="info-label">Ngành quan tâm:</div>
                <div class="info-value">${data.program}</div>
              </div>` : ''}
              ${data.notes ? `
              <div class="info-row">
                <div class="info-label">Nội dung / Ghi chú:</div>
                <div class="info-value" style="font-style: italic;">"${data.notes}"</div>
              </div>` : ''}
            </div>
            <div class="button-container">
              <a href="${getSiteUrl()}/admin/consultations" class="button">Vào trang quản trị</a>
            </div>
          </div>
          <div class="footer">
            Đây là email tự động từ Hệ Thống Tư Vấn Tuyển Sinh. Vui lòng không trả lời email này.
          </div>
        </div>
      </body>
    </html>
  `;
  await sendEmail({ to: adminEmails, subject: `[Tư vấn] Yêu cầu từ ${data.name}`, html });
}

export async function notifyNewQuestion(data: { qId: string, askerName: string, question: string, categoryName?: string | null }) {
  const adminEmails = await getAdminAndCVDEmails();
  if (adminEmails.length === 0) return;

  const html = `
    <html>
      <head>
        <style>${styles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);">
            <h1>❓ Có câu hỏi Q&A mới</h1>
          </div>
          <div class="content">
            <h2>Chi tiết câu hỏi</h2>
            <p>Hệ thống vừa nhận được một câu hỏi mới đang chờ giải đáp:</p>
            <div class="info-box">
              <div class="info-row">
                <div class="info-label">Người hỏi:</div>
                <div class="info-value">${data.askerName}</div>
              </div>
              ${data.categoryName ? `
              <div class="info-row">
                <div class="info-label">Lĩnh vực / Ngành:</div>
                <div class="info-value">${data.categoryName}</div>
              </div>` : ''}
              <div class="info-row" style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e2e8f0;">
                <div class="info-label">Nội dung câu hỏi:</div>
                <div class="info-value" style="font-size: 16px; font-weight: 500; font-style: italic; color: #0f172a;">"${data.question}"</div>
              </div>
            </div>
            <div class="button-container">
              <a href="${getSiteUrl()}/admin/qa" class="button" style="background-color: #ea580c; box-shadow: 0 2px 4px rgba(234, 88, 12, 0.2);">Xử lý câu hỏi ngay</a>
            </div>
          </div>
          <div class="footer">
            Đây là email tự động từ Hệ Thống Tư Vấn Tuyển Sinh. Vui lòng không trả lời email này.
          </div>
        </div>
      </body>
    </html>
  `;
  await sendEmail({ to: adminEmails, subject: `[Q&A Mới] Câu hỏi từ ${data.askerName}`, html });
}

export async function notifyStudentQuestionAnswered(userEmail: string, data: { askerName: string, question: string, answer: string }) {
  const html = `
    <html>
      <head>
        <style>${styles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            <h1>✨ Câu hỏi của bạn đã được giải đáp</h1>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <span class="status-badge">Đã giải đáp 🎉</span>
            </div>
            <p style="font-size: 16px;">Chào bạn <strong>${data.askerName}</strong>,</p>
            <p>Câu hỏi của bạn đã được Chuyên viên tư vấn xem xét và giải đáp. Dưới đây là thông tin chi tiết:</p>
            
            <div class="info-box" style="margin-top: 20px;">
              <span class="info-label">Câu hỏi của bạn:</span>
              <p style="color: #475569; font-weight: 500; font-style: italic; margin-top: 8px;">"${data.question}"</p>
            </div>
            
            <div class="reply-box">
              <span class="reply-label">👨‍🏫 Chuyên viên phản hồi:</span>
              <p class="reply-content">${data.answer}</p>
            </div>

            <div class="button-container">
              <a href="${getSiteUrl()}/qa" class="button" style="background-color: #059669; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);">Xem tất cả giải đáp</a>
            </div>
          </div>
          <div class="footer">
            Đây là email tự động từ Hệ Thống Tư Vấn Tuyển Sinh. Nếu bạn có thêm thắc mắc, vui lòng truy cập website và gửi câu hỏi mới.
          </div>
        </div>
      </body>
    </html>
  `;
  await sendEmail({ to: userEmail, subject: `Re: Câu hỏi tư vấn tuyển sinh của bạn đã được giải đáp`, html });
}

export async function notifyChatbotRating(data: { rating: number, feedback?: string, history: any[] }) {
  const adminEmails = await getAdminEmails();
  if (adminEmails.length === 0) return;

  const historyHtml = data.history.map((msg: any) => `
    <div style="margin-bottom: 10px; padding: 10px; border-radius: 8px; background-color: ${msg.role === 'user' ? '#eff6ff' : '#f8fafc'}; border: 1px solid ${msg.role === 'user' ? '#bfdbfe' : '#e2e8f0'};">
      <strong style="color: ${msg.role === 'user' ? '#1d4ed8' : '#475569'};">${msg.role === 'user' ? '👤 Người dùng' : '🤖 Chatbot'}:</strong>
      <div style="margin-top: 5px; white-space: pre-wrap; font-size: 14px;">${msg.content}</div>
    </div>
  `).join('');

  const html = `
    <html>
      <head>
        <style>${styles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);">
            <h1>⭐ Đánh giá chất lượng Chatbot</h1>
          </div>
          <div class="content">
            <h2>Kết quả đánh giá</h2>
            <div class="info-box">
              <div class="info-row">
                <div class="info-label">Mức độ hài lòng:</div>
                <div class="info-value" style="font-size: 24px; color: #f59e0b;">
                  ${'★'.repeat(data.rating)}${'☆'.repeat(5 - data.rating)} (${data.rating}/5)
                </div>
              </div>
              ${data.feedback ? `
              <div class="info-row">
                <div class="info-label">Ý kiến đóng góp:</div>
                <div class="info-value" style="font-style: italic;">"${data.feedback}"</div>
              </div>` : ''}
            </div>

            <h2>Lịch sử cuộc trò chuyện</h2>
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #fff;">
              ${historyHtml || '<p style="color: #64748b; font-style: italic;">Không có nội dung trò chuyện.</p>'}
            </div>
          </div>
          <div class="footer">
            Đây là hệ thống gửi mail tự động từ Hệ Thống Tư Vấn Tuyển Sinh.
          </div>
        </div>
      </body>
    </html>
  `;
  await sendEmail({ to: adminEmails, subject: `[Chatbot Rating] Người dùng đánh giá ${data.rating} sao`, html });
}

async function getAdminAndCVDEmails() {
  const users = await prisma.systemUser.findMany({
    where: { 
      role: { in: ["ADMIN", "CVD"] }
    },
    select: { email: true }
  });
  const emails = users.map(u => u.email).filter(e => e && e.includes('@'));
  // Thêm admin Root mặc định nếu chưa có
  if (!emails.includes('nguyenluyen@nsg.edu.vn')) {
    emails.push('nguyenluyen@nsg.edu.vn');
  }
  return emails;
}

async function getAdminEmails() {
  const users = await prisma.systemUser.findMany({
    where: { 
      role: "ADMIN"
    },
    select: { email: true }
  });
  const emails = users.map(u => u.email).filter(e => e && e.includes('@'));
  // Thêm admin Root mặc định nếu chưa có
  if (!emails.includes('nguyenluyen@nsg.edu.vn')) {
    emails.push('nguyenluyen@nsg.edu.vn');
  }
  return emails;
}

export async function notifyChatbotError(errorDetails: any) {
  const adminEmails = await getAdminEmails();
  if (adminEmails.length === 0) return;

  const errorMessage = errorDetails?.message || String(errorDetails);
  const errorStack = errorDetails?.stack || '';

  const html = `
    <html>
      <head>
        <style>${styles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);">
            <h1>⚠️ Cảnh báo Lỗi Chatbot AI</h1>
          </div>
          <div class="content">
            <h2>Chi tiết lỗi</h2>
            <p>Hệ thống Chatbot AI vừa ghi nhận một lỗi trong quá trình xử lý yêu cầu:</p>
            <div class="info-box">
              <div class="info-row">
                <div class="info-label">Thời gian:</div>
                <div class="info-value">${new Date().toLocaleString('vi-VN')}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Nội dung lỗi:</div>
                <div class="info-value" style="color: #ef4444; font-family: monospace; font-size: 14px; background: #fee2e2; padding: 10px; border-radius: 4px; white-space: pre-wrap; word-break: break-all;">
                  ${errorMessage}
                </div>
              </div>
              ${errorStack ? `
              <div class="info-row" style="margin-top: 15px;">
                <div class="info-label">Stack Trace:</div>
                <div class="info-value" style="font-family: monospace; font-size: 12px; background: #f1f5f9; padding: 10px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-break: break-all;">
                  ${errorStack}
                </div>
              </div>
              ` : ''}
            </div>
            <p>Vui lòng kiểm tra lại cấu hình API Key (đặc biệt là lỗi 403 - Quota Exceeded / Permission Denied) hoặc kết nối mạng.</p>
          </div>
          <div class="footer">
            Đây là hệ thống gửi mail tự động từ Hệ Thống Tư Vấn Tuyển Sinh.
          </div>
        </div>
      </body>
    </html>
  `;
  await sendEmail({ to: adminEmails, subject: `[Cảnh báo] Lỗi Chatbot AI - API/Kết nối`, html });
}
