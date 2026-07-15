CREATE TABLE `books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`thai_title` text,
	`author` text NOT NULL,
	`cover_color` text NOT NULL,
	`cover_text_color` text DEFAULT '#172f2b' NOT NULL,
	`summary` text NOT NULL,
	`tags` text NOT NULL,
	`concerns` text NOT NULL,
	`personality` text NOT NULL,
	`reading_minutes` integer DEFAULT 300 NOT NULL,
	`audio_url` text,
	`podcast_url` text,
	`kinokuniya_url` text,
	`shopee_url` text,
	`lazada_url` text,
	`naiin_url` text,
	`thaimart_url` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_slug_unique` ON `books` (`slug`);--> statement-breakpoint
CREATE TABLE `creator_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`book_id` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`favorite_topics` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_email_unique` ON `profiles` (`email`);--> statement-breakpoint
CREATE TABLE `saved_cups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`book_id` integer NOT NULL,
	`cup_name` text NOT NULL,
	`answers` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `books` (`slug`,`title`,`thai_title`,`author`,`cover_color`,`summary`,`tags`,`concerns`,`personality`,`reading_minutes`,`audio_url`,`podcast_url`,`kinokuniya_url`,`shopee_url`,`lazada_url`,`naiin_url`) VALUES
('atomic-habits','Atomic Habits','เพราะชีวิตดีได้กว่าที่เป็น','James Clear','#f5e545','เปลี่ยนชีวิตผ่านระบบและนิสัยเล็ก ๆ ที่ทำซ้ำได้','นิสัย,ระบบ,ลงมือ','คิดเยอะจนไม่เริ่ม,อยากมีวินัย,งานและเป้าหมาย','practical,gentle,structured',320,'https://www.audible.com/search?keywords=Atomic+Habits','https://open.spotify.com/search/Atomic%20Habits','https://www.kinokuniya.co.th/search/Atomic%20Habits','https://shopee.co.th/search?keyword=atomic%20habits','https://www.lazada.co.th/catalog/?q=atomic%20habits','https://www.naiin.com/search-result?keyword=Atomic%20Habits'),
('courage-to-be-disliked','The Courage to Be Disliked','กล้าที่จะถูกเกลียด','Ichiro Kishimi','#75c8d3','บทสนทนาที่ชวนคืนอิสระในการเลือกชีวิตให้ตัวเอง','ตัวตน,อิสระ,ความสัมพันธ์','เหนื่อยกับความคาดหวัง,ความสัมพันธ์กับตัวเอง','direct,reflective,dialogue',290,'https://www.audible.com/search?keywords=The+Courage+to+Be+Disliked','https://open.spotify.com/search/The%20Courage%20to%20Be%20Disliked','https://www.kinokuniya.co.th/search/The%20Courage%20to%20Be%20Disliked','https://shopee.co.th/search?keyword=the%20courage%20to%20be%20disliked','https://www.lazada.co.th/catalog/?q=the%20courage%20to%20be%20disliked','https://www.naiin.com/search-result?keyword=กล้าที่จะถูกเกลียด'),
('maybe-you-should-talk','Maybe You Should Talk to Someone','เพราะนี่คือสิ่งที่นักบำบัดอยากบอก','Lori Gottlieb','#f39aa6','เรื่องเล่าจากห้องบำบัดที่ช่วยให้เราเห็นความเป็นมนุษย์ของตัวเอง','เยียวยา,จิตใจ,เรื่องเล่า','เหนื่อยกับความคาดหวัง,ใจล้า,ความสัมพันธ์กับตัวเอง','warm,story,empathetic',430,'https://www.audible.com/search?keywords=Maybe+You+Should+Talk+to+Someone','https://open.spotify.com/search/Maybe%20You%20Should%20Talk%20to%20Someone','https://www.kinokuniya.co.th/search/Maybe%20You%20Should%20Talk%20to%20Someone','https://shopee.co.th/search?keyword=maybe%20you%20should%20talk%20to%20someone','https://www.lazada.co.th/catalog/?q=maybe%20you%20should%20talk%20to%20someone','https://www.naiin.com/search-result?keyword=Maybe%20You%20Should%20Talk%20to%20Someone'),
('deep-work','Deep Work','จดจ่ออย่างไรในโลกที่เต็มไปด้วยสิ่งรบกวน','Cal Newport','#e94d3f','สร้างพื้นที่ทำงานลึกและปกป้องสมาธิจากสิ่งรบกวน','สมาธิ,งาน,โฟกัส','งานและเป้าหมาย,สมาธิแตก','structured,direct,practical',360,'https://www.audible.com/search?keywords=Deep+Work','https://open.spotify.com/search/Deep%20Work','https://www.kinokuniya.co.th/search/Deep%20Work','https://shopee.co.th/search?keyword=deep%20work','https://www.lazada.co.th/catalog/?q=deep%20work','https://www.naiin.com/search-result?keyword=Deep%20Work'),
('four-thousand-weeks','Four Thousand Weeks','ชีวิตเรามีแค่สี่พันสัปดาห์','Oliver Burkeman','#eb8b45','มองเวลาอย่างเป็นมนุษย์และเลิกพยายามทำทุกอย่างให้ทัน','เวลา,ชีวิต,ยอมรับ','เหนื่อยกับความคาดหวัง,งานและเป้าหมาย','reflective,witty,gentle',330,'https://www.audible.com/search?keywords=Four+Thousand+Weeks','https://open.spotify.com/search/Four%20Thousand%20Weeks','https://www.kinokuniya.co.th/search/Four%20Thousand%20Weeks','https://shopee.co.th/search?keyword=four%20thousand%20weeks','https://www.lazada.co.th/catalog/?q=four%20thousand%20weeks','https://www.naiin.com/search-result?keyword=Four%20Thousand%20Weeks'),
('designing-your-life','Designing Your Life','ออกแบบชีวิตด้วยวิธีคิดแบบนักออกแบบ','Bill Burnett & Dave Evans','#75c8d3','ทดลองอนาคตหลายแบบเพื่อค้นหาชีวิตที่เหมาะกับเรา','ชีวิต,อาชีพ,ทดลอง','อยากรู้ว่าตัวเองต้องการอะไร,งานและเป้าหมาย','creative,practical,optimistic',350,'https://www.audible.com/search?keywords=Designing+Your+Life','https://open.spotify.com/search/Designing%20Your%20Life','https://www.kinokuniya.co.th/search/Designing%20Your%20Life','https://shopee.co.th/search?keyword=designing%20your%20life','https://www.lazada.co.th/catalog/?q=designing%20your%20life','https://www.naiin.com/search-result?keyword=Designing%20Your%20Life'),
('the-comfort-book','The Comfort Book','หนังสือแห่งการปลอบประโลม','Matt Haig','#f39aa6','บันทึกสั้น ๆ สำหรับวันที่ต้องการพื้นที่หายใจ','ปลอบใจ,ความหวัง,บันทึก','ใจล้า,เหนื่อยกับความคาดหวัง','soft,short,comforting',180,'https://www.audible.com/search?keywords=The+Comfort+Book','https://open.spotify.com/search/The%20Comfort%20Book','https://www.kinokuniya.co.th/search/The%20Comfort%20Book','https://shopee.co.th/search?keyword=the%20comfort%20book','https://www.lazada.co.th/catalog/?q=the%20comfort%20book','https://www.naiin.com/search-result?keyword=The%20Comfort%20Book'),
('essentialism','Essentialism','ทำน้อยแต่ได้มาก','Greg McKeown','#f5e545','เลือกสิ่งที่สำคัญจริงและกล้าตัดสิ่งที่ไม่จำเป็น','โฟกัส,เลือก,งาน','งานและเป้าหมาย,เหนื่อยกับความคาดหวัง','clear,structured,direct',310,'https://www.audible.com/search?keywords=Essentialism','https://open.spotify.com/search/Essentialism','https://www.kinokuniya.co.th/search/Essentialism','https://shopee.co.th/search?keyword=essentialism','https://www.lazada.co.th/catalog/?q=essentialism','https://www.naiin.com/search-result?keyword=Essentialism'),
('think-again','Think Again','คิดใหม่','Adam Grant','#75c8d3','ฝึกความยืดหยุ่นทางความคิดและมีความสุขกับการเปลี่ยนใจ','ความคิด,เรียนรู้,เปิดใจ','อยากรู้ว่าตัวเองต้องการอะไร,ความสัมพันธ์กับคนอื่น','curious,research,witty',340,'https://www.audible.com/search?keywords=Think+Again+Adam+Grant','https://open.spotify.com/search/Think%20Again%20Adam%20Grant','https://www.kinokuniya.co.th/search/Think%20Again','https://shopee.co.th/search?keyword=think%20again%20adam%20grant','https://www.lazada.co.th/catalog/?q=think%20again%20adam%20grant','https://www.naiin.com/search-result?keyword=Think%20Again'),
('the-gifts-of-imperfection','The Gifts of Imperfection','ของขวัญจากความไม่สมบูรณ์แบบ','Brené Brown','#eb8b45','ยอมรับความเปราะบางและใช้ชีวิตอย่างเต็มหัวใจ','ตัวตน,เปราะบาง,ยอมรับ','เหนื่อยกับความคาดหวัง,ความสัมพันธ์กับตัวเอง','warm,research,encouraging',300,'https://www.audible.com/search?keywords=The+Gifts+of+Imperfection','https://open.spotify.com/search/The%20Gifts%20of%20Imperfection','https://www.kinokuniya.co.th/search/The%20Gifts%20of%20Imperfection','https://shopee.co.th/search?keyword=the%20gifts%20of%20imperfection','https://www.lazada.co.th/catalog/?q=the%20gifts%20of%20imperfection','https://www.naiin.com/search-result?keyword=The%20Gifts%20of%20Imperfection'),
('mans-search-for-meaning','Man''s Search for Meaning','มนุษย์ค้นหาความหมาย','Viktor E. Frankl','#172f2b','ค้นหาความหมายและเสรีภาพภายในแม้ในช่วงเวลายากที่สุด','ความหมาย,ชีวิต,ความหวัง','ใจล้า,อยากรู้ว่าตัวเองต้องการอะไร','deep,story,philosophical',260,'https://www.audible.com/search?keywords=Mans+Search+for+Meaning','https://open.spotify.com/search/Mans%20Search%20for%20Meaning','https://www.kinokuniya.co.th/search/Mans%20Search%20for%20Meaning','https://shopee.co.th/search?keyword=mans%20search%20for%20meaning','https://www.lazada.co.th/catalog/?q=mans%20search%20for%20meaning','https://www.naiin.com/search-result?keyword=Man%20Search%20for%20Meaning'),
('quiet','Quiet','พลังของคนเงียบในโลกที่ไม่เคยหยุดพูด','Susan Cain','#f39aa6','เข้าใจพลังของคนเก็บตัวและออกแบบพื้นที่ที่เหมาะกับธรรมชาติของเรา','บุคลิก,คนเก็บตัว,พลัง','ความสัมพันธ์กับตัวเอง,เหนื่อยกับความคาดหวัง','research,gentle,affirming',400,'https://www.audible.com/search?keywords=Quiet+Susan+Cain','https://open.spotify.com/search/Quiet%20Susan%20Cain','https://www.kinokuniya.co.th/search/Quiet%20Susan%20Cain','https://shopee.co.th/search?keyword=quiet%20susan%20cain','https://www.lazada.co.th/catalog/?q=quiet%20susan%20cain','https://www.naiin.com/search-result?keyword=Quiet%20Susan%20Cain');
