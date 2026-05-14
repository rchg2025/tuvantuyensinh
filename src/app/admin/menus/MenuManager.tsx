"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { saveMenusAction } from "./actions";

export default function MenuManager({ initialMenus, categories, posts }: { initialMenus: any[], categories: any[], posts: any[] }) {
  const [menus, setMenus] = useState<any[]>(initialMenus || []);
  
  // Drag and drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    setDragStartX(e.clientX);
    if(e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      // This helps with dragging visuals but we mainly use it for state
      e.dataTransfer.setData("text/html", e.currentTarget.innerHTML);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null) return;
    
    // Check horizontal movement relative to start
    const deltaX = e.clientX - dragStartX;

    let newMenus = [...menus];
    
    // Vertical Reordering
    if (draggedIdx !== index) {
      const draggedItem = newMenus[draggedIdx];
      newMenus.splice(draggedIdx, 1);
      newMenus.splice(index, 0, draggedItem);
      setDraggedIdx(index);
      // Reset startX to avoid jumping indent right after reorder
      setDragStartX(e.clientX); 
    }

    // Horizontal Indentation (kéo vô 1 bậc)
    // Only items index > 0 can be submenu
    if (draggedIdx === index) {
      if (deltaX > 40 && index > 0) {
        newMenus[index].isSubmenu = true;
        setMenus(newMenus);
      } else if (deltaX < -30) {
        newMenus[index].isSubmenu = false;
        setMenus(newMenus);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    setDraggedIdx(null);
  };

  // adding new menu state
  const [type, setType] = useState<"link" | "category" | "post">("link");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [catId, setCatId] = useState("");
  const [postId, setPostId] = useState("");

  const addMenu = () => {
    if (!title) return toast.error("Vui lòng nhập tiêu đề");
    let finalUrl = "";
    if (type === "link") finalUrl = url;
    if (type === "category") finalUrl = `/posts?categoryId=${catId}`;
    if (type === "post") finalUrl = `/posts/${postId}`;

    if (!finalUrl) return toast.error("Vui lòng chọn hoặc nhập đường dẫn chính xác!");

    const newItem = { id: Date.now().toString(), title, url: finalUrl };
    setMenus([...menus, newItem]);
    
    // reset fields
    setTitle(""); setUrl(""); setCatId(""); setPostId("");
  };

  const deleteMenu = (id: string) => {
    setMenus(menus.filter(m => m.id !== id));
  };

  const handleSave = async () => {
    // Sanitize: index 0 cannot be submenu
    const sanitized = menus.map((m, i) => {
      if (i === 0) return { ...m, isSubmenu: false };
      return m;
    });

    const t = toast.loading("Đang lưu menu...");
    const res = await saveMenusAction(sanitized);
    if(res.success) toast.success("Lưu thành công", {id: t});
    else toast.error("Lỗi khi lưu: " + res.message, {id: t});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex justify-between items-center">
          <span>Danh sách Menu Header</span>
        </h2>
        
        <p className="text-slate-500 text-sm mb-4">Kéo thả để sắp xếp lại thứ tự hiển thị của các menu.</p>
        
        <div className="flex-1 space-y-3 mb-6">
          {menus.length === 0 && <div className="text-center text-slate-400 p-8 border-2 border-dashed rounded-xl">Chưa có menu nào</div>}
          {menus.map((menu, idx) => (
            <div
              key={menu.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDrop}
              className={`flex items-center gap-4 bg-slate-50 border p-3 rounded-xl cursor-move transition-all duration-200 ${
                draggedIdx === idx ? "opacity-50 border-blue-400" : "border-slate-200"
              } ${menu.isSubmenu ? "ml-8 border-l-4 border-l-blue-400 bg-blue-50/30" : ""}`}
            >
              <div className="text-slate-400 cursor-move" title="Kéo ngang để tạo menu con">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-800">{menu.title} {menu.isSubmenu && <span className="text-xs font-normal text-blue-500 bg-blue-100 px-2 py-0.5 rounded ml-2">Menu con</span>}</div>
                <div className="text-xs text-blue-600 truncate">{menu.url}</div>
              </div>
              <button 
                onClick={() => deleteMenu(menu.id)} 
                className="text-red-500 px-3 py-1 bg-white border border-red-100 uppercase hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleSave} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow transition"
        >
          Lưu thay đổi Menu
        </button>
      </div>

      {/* Form Add Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-max">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Thêm mới Menu</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tiêu đề (Tên hiển thị) *</label>
            <input 
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="VD: Liên hệ, Về chúng tôi..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Loại liên kết</label>
            <select
              title="Loại liên kết"
              value={type} onChange={e => setType(e.target.value as any)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="link">Nhập URL trực tiếp</option>
              <option value="category">Trỏ tới Danh mục</option>
              <option value="post">Trỏ tới Bài viết</option>
            </select>
          </div>

          {type === "link" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Đường dẫn URL *</label>
              <input 
                value={url} onChange={e => setUrl(e.target.value)}
                placeholder="VD: /contact hoặc https://google.com"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {type === "category" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Chọn từ Danh mục *</label>
              <select
                title="Chọn từ Danh mục"
                value={catId} onChange={e => setCatId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {type === "post" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Chọn từ Bài viết *</label>
              <select
                title="Chọn từ Bài viết"
                value={postId} onChange={e => setPostId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn bài viết --</option>
                {posts.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          )}

          <div className="pt-4">
            <button 
              onClick={addMenu}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg transition-colors w-full"
            >
              + Thêm vào danh sách
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}