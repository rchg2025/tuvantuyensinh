import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.post.createMany({
    data: [
      {
        title: "Tuyển sinh 2026 chính thức bắt đầu",
        content: "Năm nay sẽ có những thay đổi lớn về cách tính điểm...",
      },
      {
         title: "Hướng dẫn làm thủ tục nhập học",
         content: "Cần chuẩn bị hồ sơ gì, thời gian ra sao..."
      }
    ]
  });

  await prisma.question.createMany({
     data: [
        {
           askerName: "Nguyễn Văn A",
           question: "Cho em hỏi ngành Công Nghệ Thông Tin lấy bao nhiêu điểm?",
           answer: "Chào em, năm ngoái ngành dự kiến lấy 25 điểm. Em tham khảo nhé."
        },
        {
           askerName: "Trần Thị B",
           question: "Em có thể nộp học bạ không?",
           answer: null
        }
     ]
  });
  console.log("Seeding done!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
