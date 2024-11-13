const structure = (subtitle,paragraph,image)=>{
    return `<h6>${subtitle}</h6>
                                <img src="${image}" alt="Image" class="img-fluid">
                                <p>${paragraph}</p>`;
}
const endAndStrat = (text)=>{
    return `<div class="blog-article-end-feature">
                                    <p>${text}</p>
                                </div>`;
}
fetch('../blog.post.json')
    .then(response => response.json())
    .then(data => {
        let posts = data.posts;
        let id = localStorage.getItem('postId');
        let post;
        let found = false;
        for (var i = 0; i < posts.length; i++) {
            if (posts[i].id == id) {
                post = posts[i];
                found = true;
                break;
            }
        }
        if (found) {
            document.title = post.title;
            document.getElementById("title").innerText = post.title;
            document.getElementById("main_image").src = post.main_image;
            document.getElementById("main_image").style.height= "80vh";
            document.getElementById("tag").innerText = post.tag;
            document.getElementById("paragraph_container").insertAdjacentHTML('beforeend', endAndStrat(post.introduction));
            document.getElementById("paragraph_container").insertAdjacentHTML('beforeend', structure(
                post.sub_title_1, post.paragraph_1, post.image_paragraph_1));
            document.getElementById("paragraph_container").insertAdjacentHTML('beforeend', structure(
                post.sub_title_2, post.paragraph_2, post.image_paragraph_2));
            document.getElementById("paragraph_container").insertAdjacentHTML('beforeend', structure(
                post.sub_title_3, post.paragraph_3, post.image_paragraph_3));
            document.getElementById("paragraph_container").insertAdjacentHTML('beforeend', endAndStrat(post.call_to_action));
        }
        let firstId = 0;
        let secondId = 0;
        while (true) {
            let num = Math.floor(Math.random() * 9);
            if (num!=id) {
                firstId = num;
                break;
            }
        }
        while (true) {
            let num = Math.floor(Math.random() * 9);
            if (num != firstId && num!=id) {
                secondId = num;
                break;
            }
        }
        document.getElementById('1_sugestion_tag').innerText = posts[firstId].tag;
        document.getElementById('1_sugestion_title').innerText = posts[firstId].title;
        document.getElementById('1_sugestion_image').innerText = posts[firstId].main_image;
        document.querySelectorAll(".sugestion_link_1").forEach((link)=>{
            link.onclick = ()=> {
                localStorage.setItem("postId", (firstId + 1).toString());
                window.open("blog-post.html", "_self");
            }
        });
        document.getElementById('2_sugestion_tag').innerText = posts[secondId].tag;
        document.getElementById('2_sugestion_title').innerText = posts[secondId].title;
        document.getElementById('2_sugestion_image').innerText = posts[secondId].main_image;
        document.querySelectorAll(".sugestion_link_2").forEach((link)=>{
            link.onclick = () => {
                localStorage.setItem("postId", (secondId + 1).toString());
                window.open("blog-post.html", "_self");
            }
        });
    });
