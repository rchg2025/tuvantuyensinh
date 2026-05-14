import nodemailer from 'nodemailer';
import prisma from './prisma';

export async function getMailer() {
  const configs = await prisma.systemConfig.findMany({
    where: {
      key: { in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'mail_from'] }
    }
  });

  const configMap = configs.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const host = configMap['smtp_host'];
  const port = parseInt(configMap['smtp_port'] || '465');
  const user = configMap['smtp_user'];
  const pass = configMap['smtp_pass'];
  const from = configMap['mail_from'] || user;

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
  .info-row { margin-bottom: 15px; display: flex; flex-direction: column; }
  .info-row:last-child { margin-bottom: 0; }
  .info-label { font-weight: 600; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
  .info-value { color: #0f172a; font-weight: 500; word-break: break-word; }
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
  
  try {
    await mailer.transporter.sendMail({
      from: mailer.from,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error("Lỗi gửi mail: ", error);
    return false;
  }
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
                <span class="info-label">Họ và tên</span>
                <span class="info-value">${data.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Số điện thoại</span>
                <span class="info-value" style="color: #2563eb; font-weight: 700;">${data.phone}</span>
              </div>
              ${data.email ? `
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value"><a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a></span>
              </div>` : ''}
              ${data.program ? `
              <div class="info-row">
                <span class="info-label">Ngành quan tâm</span>
                <span class="info-value">${data.program}</span>
              </div>` : ''}
              ${data.notes ? `
              <div class="info-row">
                <span class="info-label">Nội dung / Ghi chú</span>
                <span class="info-value" style="font-style: italic;">"${data.notes}"</span>
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
                <span class="info-label">Người hỏi</span>
                <span class="info-value">${data.askerName}</span>
              </div>
              ${data.categoryName ? `
              <div class="info-row">
                <span class="info-label">Lĩnh vực / Ngành</span>
                <span class="info-value">${data.categoryName}</span>
              </div>` : ''}
              <div class="info-row" style="margin-top: 10px; padding-top: 15px; border-top: 1px dashed #e2e8f0;">
                <span class="info-label">Nội dung câu hỏi</span>
                <span class="info-value" style="font-size: 16px; font-weight: 500; font-style: italic; color: #0f172a;">"${data.question}"</span>
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
