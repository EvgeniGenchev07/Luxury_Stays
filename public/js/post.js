document.addEventListener("DOMContentLoaded", function() {
    let lang = sessionStorage.getItem("lang");
    if (lang == null) {
        lang = "en";
    }
    fetch(`../locales/${lang}.json`)

        .then(response => response.json())
        .then(data => {
            let posts = data.posts;
            let params = new URLSearchParams(window.location.search);
            let post_name = params.get('name');
            let post_id;
            let post;
            let found = false;
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].title.toLowerCase() == post_name) {
                    post = posts[i];
                    post_id = parseInt(posts[i].id);
                    found = true;
                    break;
                }
            }
            if (found) {
                document.title = post.title;
                document.getElementById("post-title").innerText = post.title;
                document.getElementById("post-title-small").innerText = post.title;
                document.getElementById("post-summary").innerText = post.summarize;
                document.getElementById("post-introduction").innerText = post.introduction;
                document.querySelector("#post-cover-image").style.setProperty("background-image", `url('../images/${post.main_image}')`);

                document.getElementById("post-tag").innerText = post.tag;
                document.getElementById("post-call-to-action").innerText = post.call_to_action;

                document.getElementById("subtitle-1").innerText = post.sub_title_1;
                document.getElementById("paragraph-1").innerText = post.paragraph_1;
                document.getElementById("image-1").src = '../images/' + post.image_paragraph_1;

                document.getElementById("subtitle-2").innerText = post.sub_title_2;
                document.getElementById("paragraph-2").innerText = post.paragraph_2;
                document.getElementById("image-2").src = '../images/' + post.image_paragraph_2;

                document.getElementById("subtitle-3").innerText = post.sub_title_3;
                document.getElementById("paragraph-3").innerText = post.paragraph_3;
                document.getElementById("image-3").src = '../images/' + post.image_paragraph_3;

                document.querySelector("#section-reserve-now").style.setProperty("background-image", `url('../images/${post.main_image}')`);
            } else {
                window.open('404.html', '_self');
            }
            let firstId = 0;
            let secondId = 0;
            while (true) {
                let num = Math.floor(Math.random() * 9);
                if (num != post_id - 1) {
                    firstId = num;
                    break;
                }
            }
            while (true) {
                let num = Math.floor(Math.random() * 9);
                if (num != firstId && num != post_id - 1) {
                    secondId = num;
                    break;
                }
            }
            document.getElementById('first-suggestion-tag').innerText = posts[firstId].tag;
            document.getElementById('first-suggestion-title').innerText = posts[firstId].title;
            document.getElementById('first-suggestion-image').src = '../images/' + posts[firstId].main_image;
            document.querySelectorAll(".first-suggestion-link").forEach((link) => {
                link.onclick = () => {
                    window.open("post.html?name=" + posts[firstId].title.toLowerCase(), "_self");
                }
            });
            document.getElementById('second-suggestion-tag').innerText = posts[secondId].tag;
            document.getElementById('second-suggestion-title').innerText = posts[secondId].title;
            document.getElementById('second-suggestion-image').src = '../images/' + posts[secondId].main_image;
            document.querySelectorAll(".second-suggestion-link").forEach((link) => {
                link.onclick = () => {
                    window.open("post.html?name=" + posts[secondId].title.toLowerCase(), "_self");
                }
            });
        });
});
