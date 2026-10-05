export type JournalArticle = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  readingTime: string;
  seoTitle: string;
  seoDescription: string;
  content: string[];
};

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    slug: "ai-thay-doi-cach-chon-size-quan-ao",
    category: "FASHION TECH",
    title: "Công nghệ AI thay đổi cách chọn size quần áo như thế nào?",
    excerpt: "Khám phá cách AI Virtual Try-On giúp người mua hình dung trang phục trên cơ thể và giảm nỗi lo chọn sai size khi mua sắm trực tuyến.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    date: "05/10/2026",
    readingTime: "5 phút đọc",
    seoTitle: "AI Virtual Try-On thay đổi cách chọn size quần áo online | WEARO",
    seoDescription: "Tìm hiểu AI Virtual Try-On, cách công nghệ hỗ trợ hình dung trang phục và cải thiện trải nghiệm chọn size khi mua thời trang online.",
    content: [
      "Mua quần áo trực tuyến thường bắt đầu bằng một câu hỏi rất đơn giản: mặc lên người mình sẽ trông như thế nào? Bảng size cho biết số đo, nhưng chưa thể cho người mua hình dung đầy đủ về phom dáng và tỷ lệ của một outfit.",
      "AI Virtual Try-On mở ra một cách tiếp cận khác. Thay vì chỉ đọc thông số, người dùng có thể đưa ảnh cá nhân vào hệ thống để hình dung trang phục trên chính cơ thể của mình. Đây là bước chuyển từ việc chọn sản phẩm theo mô tả sang trải nghiệm sản phẩm trực quan hơn.",
      "Với một thương hiệu thời trang số, công nghệ này không thay thế hoàn toàn bảng size hay tư vấn viên. Nó đóng vai trò bổ trợ, giúp người mua có thêm thông tin trước khi quyết định và giảm sự thiếu chắc chắn trong quá trình mua hàng."
    ]
  },
  {
    slug: "phoi-do-unisex-cho-gioi-tre-do-thi",
    category: "STREETWEAR TRENDS",
    title: "Phối đồ Unisex chuẩn gu cho giới trẻ đô thị 2026",
    excerpt: "Từ áo oversized đến quần straight-leg, khám phá công thức phối đồ unisex dễ áp dụng cho nhịp sống đô thị.",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop",
    date: "03/10/2026",
    readingTime: "6 phút đọc",
    seoTitle: "Cách phối đồ Unisex cho giới trẻ đô thị 2026 | WEARO",
    seoDescription: "Gợi ý cách phối đồ unisex hiện đại với oversized, straight-leg và layering cho đi học, đi làm và xuống phố.",
    content: [
      "Phong cách unisex không có nghĩa là mọi người phải mặc cùng một công thức. Điểm quan trọng nằm ở tỷ lệ, chất liệu và cách phối để một món đồ có thể phù hợp với nhiều cá tính.",
      "Một công thức dễ bắt đầu là kết hợp áo có phom rộng với quần straight-leg hoặc relaxed-fit. Khi phần trên đã có volume, phần dưới nên giữ đường nét gọn hơn để tổng thể không bị nặng.",
      "Layering cũng là một cách tạo điểm nhấn mà không cần quá nhiều màu sắc. Một lớp áo khoác nhẹ, túi đeo chéo hoặc phụ kiện kim loại vừa đủ có thể biến một set cơ bản thành outfit có cá tính."
    ]
  },
  {
    slug: "toi-uu-goi-y-ai-personal-stylist",
    category: "AI STYLIST",
    title: "5 cách tối ưu hóa gợi ý phối đồ từ AI Personal Stylist",
    excerpt: "AI có thể gợi ý nhanh hơn, nhưng kết quả tốt phụ thuộc vào cách bạn cung cấp bối cảnh, vóc dáng và mục đích mặc.",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop",
    date: "01/10/2026",
    readingTime: "5 phút đọc",
    seoTitle: "AI Personal Stylist: 5 cách nhận gợi ý phối đồ tốt hơn | WEARO",
    seoDescription: "5 cách cung cấp thông tin để AI Personal Stylist đưa ra gợi ý outfit phù hợp hơn với vóc dáng, hoàn cảnh và phong cách cá nhân.",
    content: [
      "Một AI stylist tốt không chỉ nhìn vào từng sản phẩm riêng lẻ. Nó cần hiểu người mặc muốn đi đâu, cần phong cách nào và ưu tiên điều gì trong outfit.",
      "Hãy bắt đầu bằng bối cảnh cụ thể: đi học, đi làm, hẹn hò, du lịch hay dạo phố. Sau đó mô tả mức độ thoải mái, phom dáng yêu thích và những món đồ bạn thường mặc.",
      "Cuối cùng, hãy xem gợi ý của AI như một điểm xuất phát. Bạn vẫn là người quyết định màu sắc, chất liệu và mức độ phù hợp với phong cách cá nhân."
    ]
  },
  {
    slug: "capsule-wardrobe-unisex",
    category: "STYLE GUIDE",
    title: "Capsule wardrobe Unisex: ít món đồ, nhiều cách mặc",
    excerpt: "Xây dựng tủ đồ tinh gọn với những item có thể kết hợp linh hoạt thay vì mua quá nhiều món giống nhau.",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1200&auto=format&fit=crop",
    date: "29/09/2026",
    readingTime: "6 phút đọc",
    seoTitle: "Capsule wardrobe Unisex: cách xây tủ đồ tối giản | WEARO",
    seoDescription: "Hướng dẫn xây dựng capsule wardrobe unisex với các món đồ cơ bản, dễ phối và phù hợp phong cách sống hiện đại.",
    content: [
      "Capsule wardrobe là cách tổ chức tủ đồ xoay quanh một số món chủ lực có khả năng kết hợp với nhau. Mục tiêu không phải sở hữu càng ít quần áo càng tốt, mà là giảm những món ít được sử dụng.",
      "Một tủ đồ unisex có thể bắt đầu từ áo thun cơ bản, sơ mi rộng, quần straight-leg, outerwear nhẹ và một đôi giày dễ phối. Khi màu sắc được kiểm soát, số lượng outfit tạo ra sẽ tăng lên đáng kể.",
      "Trước khi mua thêm, hãy kiểm tra món đồ mới có thể kết hợp với ít nhất ba món đang có hay không. Đây là một nguyên tắc đơn giản nhưng giúp việc mua sắm có chủ đích hơn."
    ]
  },
  {
    slug: "streetwear-va-casual-khac-nhau-the-nao",
    category: "STYLE GUIDE",
    title: "Streetwear và Casual khác nhau thế nào?",
    excerpt: "Hai phong cách thường được dùng lẫn nhau nhưng có khác biệt rõ về phom dáng, cảm giác tổng thể và cách xây dựng outfit.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop",
    date: "27/09/2026",
    readingTime: "5 phút đọc",
    seoTitle: "Streetwear và Casual khác nhau thế nào? | WEARO",
    seoDescription: "Phân biệt Streetwear và Casual qua phom dáng, màu sắc, layering và cách phối đồ thực tế.",
    content: [
      "Casual thường tập trung vào sự thoải mái và dễ mặc trong đời sống hằng ngày. Streetwear có thể sử dụng những yếu tố tương tự nhưng thường nhấn mạnh hơn vào silhouette, graphic, layering và tinh thần văn hóa đường phố.",
      "Ranh giới giữa hai phong cách ngày càng linh hoạt. Một chiếc áo oversized, quần straight-leg và sneaker có thể nằm trong cả hai nhóm tùy cách phối.",
      "Thay vì quá chú trọng tên gọi, hãy tập trung vào tỷ lệ và cảm giác bạn muốn tạo ra. Phong cách tốt là phong cách phù hợp với người mặc và hoàn cảnh."
    ]
  },
  {
    slug: "chon-ao-oversized-theo-voc-dang",
    category: "STYLE GUIDE",
    title: "Cách chọn áo oversized theo vóc dáng",
    excerpt: "Oversized đẹp không chỉ nằm ở việc chọn size lớn hơn. Tỷ lệ vai, chiều dài áo và độ rộng tay quyết định tổng thể.",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1200&auto=format&fit=crop",
    date: "25/09/2026",
    readingTime: "5 phút đọc",
    seoTitle: "Cách chọn áo oversized theo vóc dáng nam nữ | WEARO",
    seoDescription: "Hướng dẫn chọn áo oversized dựa trên tỷ lệ cơ thể, chiều dài áo, vai và cách phối quần.",
    content: [
      "Oversized không đơn giản là tăng một hoặc hai size. Một chiếc áo có thiết kế oversized thường đã được tính toán lại vai, thân và tay áo để giữ được tỷ lệ.",
      "Nếu phần vai rộng, hãy chú ý chiều dài áo để tránh làm cơ thể bị ngắn lại. Với người có chiều cao khiêm tốn, sơ vin một phần hoặc chọn quần có đường cạp rõ có thể giúp cân bằng tỷ lệ.",
      "Quan trọng nhất là nhìn tổng thể outfit thay vì đánh giá riêng chiếc áo. Một chiếc oversized hợp lý thường cần một món đồ phía dưới có cấu trúc rõ ràng."
    ]
  },
  {
    slug: "mua-thoi-trang-online-va-noi-lo-khong-hop-form",
    category: "FASHION TECH",
    title: "Vì sao mua thời trang online vẫn khiến người dùng lo không hợp form?",
    excerpt: "Ảnh sản phẩm đẹp và bảng size chưa đủ để trả lời câu hỏi quan trọng nhất: món đồ có hợp với chính mình không?",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop",
    date: "23/09/2026",
    readingTime: "6 phút đọc",
    seoTitle: "Mua quần áo online: vì sao khách hàng lo không hợp form?",
    seoDescription: "Phân tích nỗi lo chọn sai form khi mua quần áo online và vai trò của hình ảnh, size guide và công nghệ AI.",
    content: [
      "Khi mua thời trang online, người dùng thường nhìn thấy sản phẩm trên một người mẫu có chiều cao, vóc dáng và cách tạo dáng khác mình. Vì vậy, việc hình dung kết quả thực tế luôn có một khoảng cách.",
      "Bảng size giải quyết vấn đề kích thước nhưng không thể mô tả đầy đủ độ rũ của vải, vị trí đường vai hoặc cách một silhouette thay đổi theo tỷ lệ cơ thể.",
      "Đây là lý do các công cụ trực quan như virtual try-on có tiềm năng trở thành một lớp thông tin bổ sung cho trải nghiệm mua sắm số."
    ]
  },
  {
    slug: "thoi-trang-ben-vung-va-mua-sam-co-chu-dich",
    category: "LIFESTYLE",
    title: "Thời trang bền vững bắt đầu từ việc mua sắm có chủ đích",
    excerpt: "Không nhất thiết phải thay đổi toàn bộ tủ đồ. Một cách tiếp cận thực tế là mua ít hơn nhưng hiểu rõ mình cần gì.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop",
    date: "21/09/2026",
    readingTime: "5 phút đọc",
    seoTitle: "Mua sắm thời trang có chủ đích và tủ đồ bền vững | WEARO",
    seoDescription: "Những nguyên tắc đơn giản giúp người trẻ mua thời trang có chủ đích và xây dựng tủ đồ sử dụng lâu dài.",
    content: [
      "Thời trang bền vững không nhất thiết bắt đầu bằng những quyết định lớn. Một bước thực tế hơn là giảm các lần mua theo cảm xúc và tăng tỷ lệ sử dụng của từng món đồ.",
      "Trước khi mua, hãy đặt ba câu hỏi: mình sẽ mặc món này ở đâu, nó phối được với những gì đang có, và mình có thực sự cần thêm một món tương tự không?",
      "Khi công nghệ giúp người dùng hình dung outfit trước khi mua, quyết định mua sắm cũng có thể trở nên có chủ đích hơn thay vì chỉ dựa vào cảm xúc tại thời điểm xem sản phẩm."
    ]
  },
  {
    slug: "mau-sac-trung-tinh-trong-tu-do-unisex",
    category: "TRENDS",
    title: "Vì sao màu trung tính luôn có chỗ trong tủ đồ Unisex?",
    excerpt: "Những gam màu trung tính giúp tăng khả năng phối đồ và tạo nền cho các món statement.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    date: "19/09/2026",
    readingTime: "4 phút đọc",
    seoTitle: "Màu trung tính trong tủ đồ Unisex: cách phối dễ mặc | WEARO",
    seoDescription: "Cách sử dụng màu trung tính để xây dựng tủ đồ unisex linh hoạt, hiện đại và dễ phối.",
    content: [
      "Màu trung tính có ưu điểm lớn là khả năng kết hợp. Trắng, đen, xám, be và các sắc xanh dịu có thể tạo nền cho nhiều outfit mà không khiến tủ đồ trở nên đơn điệu.",
      "Một công thức dễ áp dụng là chọn một màu chủ đạo, một màu hỗ trợ và một điểm nhấn nhỏ. Nhờ vậy outfit vẫn có cấu trúc nhưng không cần quá nhiều màu.",
      "Điều quan trọng không phải mặc toàn màu trung tính mà là dùng chúng để kiểm soát tổng thể. Một món đồ có màu mạnh sẽ nổi bật hơn khi được đặt cạnh nền màu đơn giản."
    ]
  },
  {
    slug: "layering-cho-thoi-tiet-nhiet-doi",
    category: "STYLE GUIDE",
    title: "Layering cho thời tiết nhiệt đới: mặc nhiều lớp mà không nặng nề",
    excerpt: "Layering ở khí hậu nóng cần ưu tiên chất liệu, khoảng hở và số lớp thay vì chỉ tập trung vào số lượng áo.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    date: "17/09/2026",
    readingTime: "5 phút đọc",
    seoTitle: "Cách layering thời trang cho thời tiết nóng | WEARO",
    seoDescription: "Gợi ý layering phù hợp khí hậu nhiệt đới với chất liệu nhẹ, phom rộng và cách phối linh hoạt.",
    content: [
      "Layering trong khí hậu nhiệt đới cần khác với cách phối đồ mùa đông. Mục tiêu là tạo chiều sâu thị giác nhưng vẫn giữ được sự thoải mái khi di chuyển.",
      "Một lớp áo thun, sơ mi khoác ngoài hoặc jacket mỏng đã đủ tạo hiệu ứng. Chất liệu thoáng và phom không quá ôm sẽ giúp tổng thể dễ chịu hơn.",
      "Hãy ưu tiên những lớp có thể tháo ra nhanh. Đây là cách biến một outfit thành nhiều trạng thái phù hợp với việc di chuyển giữa ngoài trời, văn phòng và không gian có điều hòa."
    ]
  },
  {
    slug: "ai-va-ca-nhan-hoa-trai-nghiem-mua-sam",
    category: "FASHION TECH",
    title: "AI và cá nhân hóa trải nghiệm mua sắm thời trang",
    excerpt: "Từ tìm kiếm sản phẩm đến gợi ý outfit, AI đang chuyển trải nghiệm mua sắm từ một catalog tĩnh sang hành trình cá nhân hóa.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop",
    date: "15/09/2026",
    readingTime: "6 phút đọc",
    seoTitle: "AI cá nhân hóa trải nghiệm mua sắm thời trang như thế nào?",
    seoDescription: "Tìm hiểu vai trò của AI trong tìm kiếm, gợi ý outfit và cá nhân hóa trải nghiệm thương mại điện tử thời trang.",
    content: [
      "Một cửa hàng online truyền thống thường đưa người dùng qua danh sách sản phẩm. AI cho phép trải nghiệm chuyển sang hướng ngược lại: bắt đầu từ nhu cầu của người dùng rồi tìm sản phẩm phù hợp.",
      "AI stylist có thể kết hợp nhiều tín hiệu như phong cách, bối cảnh, sản phẩm đang có và mục tiêu của người mặc để tạo đề xuất. Khi kết hợp với virtual try-on, đề xuất đó trở nên trực quan hơn.",
      "Tuy nhiên, cá nhân hóa hiệu quả cần dữ liệu phù hợp và cách xử lý minh bạch. AI nên hỗ trợ quyết định chứ không làm mất quyền kiểm soát của người mua."
    ]
  },
  {
    slug: "5-mon-do-nen-tang-cho-tu-do-unisex",
    category: "WARDROBE",
    title: "5 món đồ nền tảng cho một tủ đồ Unisex hiện đại",
    excerpt: "Một tủ đồ linh hoạt có thể bắt đầu từ vài món cơ bản có phom dáng tốt và khả năng phối cao.",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop",
    date: "13/09/2026",
    readingTime: "5 phút đọc",
    seoTitle: "5 món đồ cơ bản cần có trong tủ đồ Unisex | WEARO",
    seoDescription: "Danh sách 5 món đồ nền tảng giúp xây dựng tủ đồ unisex hiện đại, dễ phối và phù hợp nhiều hoàn cảnh.",
    content: [
      "Một tủ đồ tốt không cần quá nhiều item. Điều quan trọng là các món nền tảng phải có phom dễ mặc và có thể đi cùng nhiều loại trang phục.",
      "Áo thun, sơ mi rộng, quần straight-leg, outerwear nhẹ và sneaker là năm nhóm có thể tạo ra nhiều outfit khác nhau. Tùy phong cách cá nhân, từng nhóm có thể thay đổi chất liệu hoặc màu sắc.",
      "Sau khi có nền tảng, hãy bổ sung các món tạo dấu ấn riêng. Tỷ lệ giữa basic và statement sẽ quyết định cá tính của tủ đồ."
    ]
  },
  {
    slug: "cach-xay-dung-phong-cach-ca-nhan",
    category: "LIFESTYLE",
    title: "Cách xây dựng phong cách cá nhân mà không chạy theo mọi xu hướng",
    excerpt: "Phong cách cá nhân không phải danh sách trend. Đó là hệ thống những lựa chọn lặp lại phù hợp với bạn.",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1200&auto=format&fit=crop",
    date: "11/09/2026",
    readingTime: "5 phút đọc",
    seoTitle: "Cách xây dựng phong cách cá nhân bền vững | WEARO",
    seoDescription: "Hướng dẫn xây dựng phong cách cá nhân dựa trên vóc dáng, thói quen, màu sắc và hoàn cảnh sử dụng.",
    content: [
      "Phong cách cá nhân hình thành từ những lựa chọn bạn lặp lại nhiều lần. Nếu một kiểu phom, màu sắc hoặc chất liệu liên tục xuất hiện trong outfit của bạn, đó chính là một phần ngôn ngữ thời trang riêng.",
      "Thay vì lưu quá nhiều hình ảnh trend, hãy tìm điểm chung giữa những outfit bạn thực sự muốn mặc. Có thể đó là silhouette rộng, bảng màu trầm hoặc cách layering tối giản.",
      "Một phong cách tốt phải sống được trong đời thường. Nếu một outfit đẹp nhưng khiến bạn không thoải mái hoặc khó sử dụng, nó chưa chắc là lựa chọn phù hợp."
    ]
  },
  {
    slug: "chon-outfit-di-hoc-di-lam-va-xuong-pho",
    category: "OUTFIT GUIDE",
    title: "Một tủ đồ, ba bối cảnh: đi học, đi làm và xuống phố",
    excerpt: "Cùng một nhóm item có thể chuyển đổi giữa nhiều bối cảnh nếu biết thay đổi layer, giày và phụ kiện.",
    image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop",
    date: "09/09/2026",
    readingTime: "5 phút đọc",
    seoTitle: "Gợi ý outfit đi học, đi làm và xuống phố | WEARO",
    seoDescription: "Cách biến một tủ đồ thành nhiều outfit cho đi học, đi làm và đi chơi mà không cần mua quá nhiều quần áo.",
    content: [
      "Khả năng chuyển đổi bối cảnh là một trong những tiêu chí quan trọng của tủ đồ hiện đại. Một set cơ bản có thể trở nên trang trọng hơn hoặc casual hơn chỉ bằng vài thay đổi.",
      "Khi đi học, ưu tiên sự thoải mái và dễ di chuyển. Khi đi làm, hãy tăng cấu trúc bằng sơ mi, jacket hoặc giày có phom rõ. Khi xuống phố, có thể thêm phụ kiện hoặc một lớp statement.",
      "Cách này giúp giảm số lượng item cần thiết mà vẫn giữ được nhiều lựa chọn outfit trong tuần."
    ]
  },
  {
    slug: "virtual-try-on-co-phai-tuong-lai-thoi-trang-online",
    category: "FASHION TECH",
    title: "Virtual Try-On có phải tương lai của thời trang online?",
    excerpt: "Từ công nghệ thử kính đến thử quần áo, trải nghiệm trực quan đang trở thành một hướng phát triển đáng chú ý của thương mại điện tử.",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop",
    date: "07/09/2026",
    readingTime: "6 phút đọc",
    seoTitle: "Virtual Try-On và tương lai thương mại điện tử thời trang",
    seoDescription: "Virtual Try-On có thể thay đổi trải nghiệm mua thời trang online như thế nào và đâu là giới hạn của công nghệ.",
    content: [
      "Virtual Try-On giải quyết một phần khoảng cách giữa hình ảnh sản phẩm và trải nghiệm mặc thật. Người dùng có thêm một lớp thông tin trực quan trước khi đưa ra quyết định.",
      "Công nghệ vẫn có giới hạn. Ánh sáng, tư thế, chất liệu và dữ liệu hình ảnh có thể ảnh hưởng đến kết quả. Vì vậy, virtual try-on nên được xem là công cụ hỗ trợ chứ không phải lời cam kết thay thế hoàn toàn việc thử đồ thật.",
      "Khi hình ảnh, AI stylist, bảng size và dữ liệu sản phẩm được kết hợp tốt, trải nghiệm mua sắm online có thể trở nên tự tin và cá nhân hóa hơn."
    ]
  },
  {
    slug: "tu-van-phoi-do-bang-ai-can-nhung-du-lieu-gi",
    category: "AI STYLIST",
    title: "AI Stylist cần những dữ liệu gì để tư vấn phối đồ tốt hơn?",
    excerpt: "Một gợi ý outfit có giá trị khi AI hiểu được người mặc, hoàn cảnh và những sản phẩm thực sự có thể mua.",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop",
    date: "05/09/2026",
    readingTime: "6 phút đọc",
    seoTitle: "AI Stylist cần dữ liệu gì để tư vấn phối đồ?",
    seoDescription: "Các nhóm dữ liệu quan trọng cho AI Stylist: phong cách, vóc dáng, bối cảnh, sản phẩm và sở thích cá nhân.",
    content: [
      "AI Stylist không chỉ cần danh sách sản phẩm. Để đưa ra gợi ý có ý nghĩa, hệ thống cần hiểu mục đích mặc, phong cách, màu sắc yêu thích và những giới hạn của người dùng.",
      "Dữ liệu sản phẩm cũng quan trọng không kém: danh mục, màu, phom, size, chất liệu và khả năng kết hợp. Nếu catalog không có cấu trúc, AI khó tạo ra đề xuất nhất quán.",
      "Một hệ thống tốt nên cho phép người dùng phản hồi lại đề xuất. Khi người dùng nói thích hoặc không thích một kiểu phối, trải nghiệm cá nhân hóa có thể tiếp tục được cải thiện."
    ]
  },
  {
    slug: "5-loi-thuong-gap-khi-phoi-do",
    category: "STYLE GUIDE",
    title: "5 lỗi thường gặp khi phối đồ và cách sửa nhanh",
    excerpt: "Không cần thay cả tủ đồ. Nhiều lỗi phối đồ có thể sửa bằng cách điều chỉnh tỷ lệ, màu sắc và số lượng điểm nhấn.",
    image: "https://images.unsplash.com/photo-1506629905607-d9f5b0d0e0d0?q=80&w=1200&auto=format&fit=crop",
    date: "03/09/2026",
    readingTime: "5 phút đọc",
    seoTitle: "5 lỗi phối đồ thường gặp và cách khắc phục | WEARO",
    seoDescription: "5 lỗi phối đồ phổ biến về tỷ lệ, màu sắc, layering và phụ kiện cùng cách sửa đơn giản.",
    content: [
      "Lỗi đầu tiên thường nằm ở tỷ lệ: cả áo và quần đều quá rộng hoặc quá ôm khiến silhouette thiếu điểm cân bằng. Hãy tạo một điểm neo bằng món đồ có cấu trúc rõ.",
      "Lỗi thứ hai là quá nhiều điểm nhấn. Khi mọi món đều muốn nổi bật, tổng thể sẽ khó nhìn. Chọn một điểm nhấn chính và để các món còn lại làm nền.",
      "Cuối cùng là mua đồ trước khi nghĩ đến khả năng phối. Trước khi thêm một món mới, hãy thử ghép nó với những món đang có để kiểm tra tính linh hoạt."
    ]
  }
];

export function getJournalArticle(slug: string) {
  return JOURNAL_ARTICLES.find((article) => article.slug === slug);
}
