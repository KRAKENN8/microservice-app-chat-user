"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Docs() {
  const router = useRouter();

  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("{}");
  const [comment, setComment] = useState("");
  const [user, setUser] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleNavigation = () => {
    router.push("/chat");
  };

  const fetchDocs = async () => {
    const res = await fetch("http://localhost:8002/documents");
    const data = await res.json();
    setDocs(data);
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      window.location.href = "/";
      return;
    }
    setUser(JSON.parse(stored));
    fetchDocs();
  }, []);

  const createDoc = async () => {
    await fetch("http://localhost:8002/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setTitle("");
    setContent("{}");
    fetchDocs();
  };

  const startEdit = (doc) => {
    setEditId(doc._id);
    setEditTitle(doc.title);
    setEditContent(doc.content);
  };

  const handleUpdate = async () => {
    if (!editId) return;

    await fetch(`http://localhost:8002/documents/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        content: editContent,
      }),
    });

    setEditId(null);
    setEditTitle("");
    setEditContent("");
    fetchDocs();
  };

  const addComment = async (id) => {
    await fetch(`http://localhost:8002/documents/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: user.name, text: comment }),
    });

    setComment("");
    fetchDocs();
  };

  return (
    <div className="h-screen flex">
      <div className="flex-1 p-4">

        <input placeholder="test" value={title} onChange={(e) => setTitle(e.target.value)} lassName="border p-2 w-full mb-2"/>

        <textarea value={content} onChange={(e) => setContent(e.target.value)} className="border p-2 w-full mb-2"/>

        <button onClick={createDoc} className="border p-2 mb-4">Create</button>

        {docs.map((d) => (
          <div key={d._id} className="border p-3 mb-3">

            <strong>{d.title}</strong>
            <pre>{d.content}</pre>

            {editId === d._id && (
              <div className="border p-2">
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="border p-2 w-full"/>
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="border p-2 w-full mb-2"/>
                <button className="border p-2" onClick={handleUpdate}>Save</button>
              </div>
            )}

            <div className="p-2">
              <input value={comment} onChange={(e) => setComment(e.target.value)} className="border p-2 mr-1"/>
              <button onClick={() => addComment(d._id)} className="border p-2">Add Comment</button>

              {user?.role === 2 && (
              <button className="border p-2" onClick={() => startEdit(d)}>Edit</button>
            )}
            </div>

            {d.comments &&
              d.comments.map((c, i) => (
                <div key={i} className="mt-1">
                  <b>{c.user}:</b> {c.text}
                </div>
              ))}
          </div>
        ))}
      </div>

      <div className="p-4">
        <button className="border p-2" onClick={handleNavigation}>Go to Chat</button>
      </div>
    </div>
  );
}
