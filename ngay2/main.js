async function LoadData() {
    let res = await fetch("http://localhost:3000/posts")
    let posts = await res.json();
    let body = document.getElementById("body_table");
    body.innerHTML = '';
    for (const post of posts) {
        let style = post.isDeleted ? 'style="text-decoration: line-through; color: #9ca3af;"' : '';
        body.innerHTML += `<tr ${style}>
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.views}</td>
            <td>
                <input type="button" value="Xóa" onclick="Delete('${post.id}')"/>
                <input type="button" value="Sửa" onclick="EditPost('${post.id}', '${post.title}', '${post.views}')"/>
                <input type="button" value="Bình Luận" onclick="LoadComments('${post.id}')"/>
            </td>
        </tr>`
    }
}

async function CreatePost() {
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;

    try {
        let allRes = await fetch("http://localhost:3000/posts");
        let allPosts = await allRes.json();
        let maxId = 0;
        for (const p of allPosts) {
            let pid = parseInt(p.id);
            if (!isNaN(pid) && pid > maxId) maxId = pid;
        }
        let newId = (maxId + 1).toString();

        let res = await fetch('http://localhost:3000/posts', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: newId,
                title: title,
                views: views,
                isDeleted: false
            })
        });
        if (res.ok) {
            console.log("Thêm thành công");
            ResetForm();
            LoadData();
        }
    } catch (error) {
        console.log(error);
    }
}

async function UpdatePost() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;

    let res = await fetch('http://localhost:3000/posts/' + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: title,
            views: views
        })
    });
    if (res.ok) {
        console.log("Cập nhật thành công");
        ResetForm();
        LoadData();
    }
}

function EditPost(id, title, views) {
    document.getElementById("id_txt").value = id;
    document.getElementById("title_txt").value = title;
    document.getElementById("view_txt").value = views;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.getElementById("btn_add").style.display = 'none';
    document.getElementById("btn_update").style.display = 'inline-block';
    document.getElementById("btn_cancel").style.display = 'inline-block';
}

function ResetForm() {
    document.getElementById("id_txt").value = "";
    document.getElementById("title_txt").value = "";
    document.getElementById("view_txt").value = "";

    document.getElementById("btn_add").style.display = 'inline-block';
    document.getElementById("btn_update").style.display = 'none';
    document.getElementById("btn_cancel").style.display = 'none';
}

async function Delete(id) {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    // Soft delete
    let res = await fetch("http://localhost:3000/posts/" + id, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            isDeleted: true
        })
    })
    if (res.ok) {
        console.log("Xóa thành công");
    }
    LoadData();
    return false;
}

// Comments Logic
async function LoadComments(postId) {
    document.getElementById("current_post_id").value = postId;
    document.getElementById("comment_helper").style.display = 'none';

    let res = await fetch(`http://localhost:3000/comments?postId=${postId}`);
    let comments = await res.json();
    let body = document.getElementById("comments_body");
    body.innerHTML = '';
    for (const c of comments) {
        body.innerHTML += `<tr>
            <td>${c.id}</td>
            <td>${c.text}</td>
            <td>
                <button onclick="DeleteComment('${c.id}', '${postId}')">Xóa</button>
                <button onclick="EditComment('${c.id}', '${c.text}')">Sửa</button>
            </td>
        </tr>`;
    }
}

async function SaveComment() {
    let postId = document.getElementById("current_post_id").value;
    if (!postId) {
        alert("Vui lòng chọn một bài viết trước khi bình luận.");
        return;
    }

    let commentId = document.getElementById("comment_id").value;
    let text = document.getElementById("comment_text").value;

    if (!text.trim()) {
        alert("Nội dung không được để trống");
        return;
    }

    if (commentId) {
        // Update
        await fetch(`http://localhost:3000/comments/${commentId}`, {
            method: 'PATCH',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text })
        });
    } else {
        // Create
        let allRes = await fetch("http://localhost:3000/comments");
        let allComments = await allRes.json();
        let maxId = 0;
        for (const c of allComments) {
            let cid = parseInt(c.id);
            if (!isNaN(cid) && cid > maxId) maxId = cid;
        }
        let newId = (maxId + 1).toString();

        await fetch('http://localhost:3000/comments', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: newId,
                postId: postId,
                text: text
            })
        });
    }
    document.getElementById("comment_id").value = '';
    document.getElementById("comment_text").value = '';
    LoadComments(postId);
}

async function DeleteComment(id, postId) {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    await fetch(`http://localhost:3000/comments/${id}`, {
        method: 'DELETE'
    });
    LoadComments(postId);
}

function EditComment(id, text) {
    document.getElementById("comment_id").value = id;
    document.getElementById("comment_text").value = text;
}

// Init
LoadData();
