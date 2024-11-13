const randomPosts = (firstId,secondId,thirdId,posts)=>{
    return `<div class="col-lg-4 col-md-6">
            <div class="blog-item blog-item-sm">
              <div class="blog-item-image">
                <a class="post_link_1">
                  <img src="${posts[firstId].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[firstId].tag}</span>
                <h5><a class="post_link_1">${posts[firstId].title}</a></h5>
                <div class="blog-item-info-release">
                </div>
                <a class="btn btn-link post_link_1">Read Article
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 1.5L17 6M17 6L12.5 10.5M17 6H1" stroke="currentColor"
                          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="col-lg-4 my-4 my-md-0 my-lg-0 col-md-6">
            <div class="blog-item blog-item-sm">
              <div class="blog-item-image">
                <a class="post_link_2">
                  <img src="${posts[secondId].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[secondId].tag}</span>
                <h5><a class="post_link_2">${posts[secondId].title}</a></h5>
                <div class="blog-item-info-release">
                </div>
                <a class="btn btn-link post_link_2">Read Article
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 1.5L17 6M17 6L12.5 10.5M17 6H1" stroke="currentColor"
                          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mt-0 mt-md-4 mt-lg-0 col-md-6">
            <div class="blog-item blog-item-sm">
              <div class="blog-item-image">
                <a class="post_link_3">
                  <img src="${posts[thirdId].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[thirdId].tag}</span>
                <h5><a class="post_link_3">${posts[thirdId].title}</a></h5>
                <div class="blog-item-info-release">
                </div>
                <a class="btn btn-link post_link_3">Read Article
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 1.5L17 6M17 6L12.5 10.5M17 6H1" stroke="currentColor"
                          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>`;
}
fetch('../blog.post.json')
    .then(response => response.json())
    .then(data => {
        let posts = data.posts;
        let firstId = Math.floor(Math.random() * 9);
        let secondId = 0;
        let thirdId = 0;
        while (true) {
            let num = Math.floor(Math.random() * 9);
            if (num != firstId) {
                secondId = num;
                break;
            }
        }
        while (true) {
            let num = Math.floor(Math.random() * 9);
            if (num != firstId && num != secondId) {
                thirdId = num;
                break;
            }
        }
        document.getElementById('posts').innerHTML = randomPosts(firstId, secondId, thirdId,posts);
        document.querySelectorAll(".post_link_1").forEach((link)=>
        {
            link.onclick = () => {
                localStorage.setItem("postId", (firstId+1).toString());
                window.open("blog-post.html", "_self");
            }
        });
        document.querySelectorAll(".post_link_2").forEach((link)=>
        {
            link.onclick = () => {
                localStorage.setItem("postId", (secondId+1).toString());
                window.open("blog-post.html", "_self");
            }
        });
        document.querySelectorAll(".post_link_3").forEach((link)=>
        {
            link.onclick = () => {
                localStorage.setItem("postId", (thirdId+1).toString());
                window.open("blog-post.html", "_self");
            }
        });
    });