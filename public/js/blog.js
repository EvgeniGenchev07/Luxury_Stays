const postsModel = (posts) => {
        return `<div class="col-lg-4 col-md-6">
            <div class="blog-item blog-item-sm">
              <div class="blog-item-image">
                <a class="post_link_1">
                  <img src="${posts[0].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[0].tag}</span>
                <h5><a class="post_link_1">${posts[0].title}</a></h5>
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
                  <img src="${posts[1].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[1].tag}</span>
                <h5><a class="post_link_2">${posts[1].title}</a></h5>
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
                  <img src="${posts[2].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[2].tag}</span>
                <h5><a class="post_link_3">${posts[2].title}</a></h5>
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
          </div>
          <div class="col-lg-4 mt-4 col-md-6">
            <div class="blog-item blog-item-sm">
              <div class="blog-item-image">
                <a class="post_link_4">
                  <img src="${posts[3].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[3].tag}</span>
                <h5><a class="post_link_4">${posts[3].title}</a></h5>
                <div class="blog-item-info-release">
                </div>
                <a class="btn btn-link post_link_4">Read Article
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 1.5L17 6M17 6L12.5 10.5M17 6H1" stroke="currentColor"
                          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mt-4 col-md-6">
            <div class="blog-item blog-item-sm">
              <div class="blog-item-image">
                <a class="post_link_5">
                  <img src="${posts[4].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[4].tag}</span>
                <h5><a class="post_link_5">${posts[4].title}</a></h5>
                <div class="blog-item-info-release">
                </div>
                <a class="btn btn-link post_link_5">Read Article
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 1.5L17 6M17 6L12.5 10.5M17 6H1" stroke="currentColor"
                          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mt-4 col-md-6">
            <div class="blog-item blog-item-sm">
              <div class="blog-item-image">
                <a class="post_link_6">
                  <img src="${posts[5].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[5].tag}</span>
                <h5><a class="post_link_6">${posts[5].title}</a></h5>
                <div class="blog-item-info-release">
                </div>
                <a class="btn btn-link post_link_6">Read Article
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 1.5L17 6M17 6L12.5 10.5M17 6H1" stroke="currentColor"
                          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
<div class="col-lg-4 mt-4 col-md-6">
            <div class="blog-item blog-item-sm">
              <div class="blog-item-image">
                <a class="post_link_4">
                  <img src="${posts[6].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[6].tag}</span>
                <h5><a class="post_link_4">${posts[6].title}</a></h5>
                <div class="blog-item-info-release">
                </div>
                <a class="btn btn-link post_link_4">Read Article
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 1.5L17 6M17 6L12.5 10.5M17 6H1" stroke="currentColor"
                          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mt-4 col-md-6">
            <div class="blog-item blog-item-sm">
              <div class="blog-item-image">
                <a class="post_link_5">
                  <img src="${posts[7].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[7].tag}</span>
                <h5><a class="post_link_5">${posts[7].title}</a></h5>
                <div class="blog-item-info-release">
                </div>
                <a class="btn btn-link post_link_5">Read Article
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 1.5L17 6M17 6L12.5 10.5M17 6H1" stroke="currentColor"
                          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mt-4 col-md-6">
            <div class="blog-item blog-item-sm">
              <div class="blog-item-image">
                <a class="post_link_6">
                  <img src="${posts[8].main_image}" alt="Image">
                </a>
              </div>
              <div class="blog-item-info">
                <span class="fs-6 has-line">${posts[8].tag}</span>
                <h5><a class="post_link_6">${posts[8].title}</a></h5>
                <div class="blog-item-info-release">
                </div>
                <a class="btn btn-link post_link_6">Read Article
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
            console.log(firstId)
            console.log(secondId)
            console.log(thirdId)
            document.getElementById('1_banner_tag').innerText = posts[firstId].tag;
            document.getElementById('1_banner_title').innerText = posts[firstId].title;
            document.getElementById('1_banner_description').innerText = posts[firstId].summarize;
            document.querySelectorAll(".banner_link_1").forEach((link) => {
                link.onclick = () => {
                    localStorage.setItem("postId", (firstId + 1).toString());
                    window.open("blog-post.html", "_self");
                }
            });
            document.getElementById('2_banner_tag').innerText = posts[secondId].tag;
            document.getElementById('2_banner_title').innerText = posts[secondId].title;
            document.getElementById('2_banner_description').innerText = posts[secondId].summarize;
            document.querySelectorAll(".banner_link_2").forEach((link) => {
                link.onclick = () => {
                    localStorage.setItem("postId", (secondId + 1).toString());
                    window.open("blog-post.html", "_self");
                }
            });
            document.getElementById('3_banner_tag').innerText = posts[thirdId].tag;
            document.getElementById('3_banner_title').innerText = posts[thirdId].title;
            document.getElementById('3_banner_description').innerText = posts[thirdId].summarize;
            document.querySelectorAll(".banner_link_3").forEach((link) => {
                link.onclick = () => {
                    localStorage.setItem("postId", (thirdId + 1).toString());
                    window.open("blog-post.html", "_self");
                }
            });
            document.getElementById('posts').innerHTML = postsModel(posts);
            for (var i = 0; i < posts.length - 1; i++) {
                let id = i + 1;
                document.querySelectorAll(".post_link_" + id).forEach((link) => {
                    link.onclick = () => {
                        localStorage.setItem("postId", id.toString());
                        window.open("blog-post.html", "_self");
                    }
                });
            }
        });
const slick_el = $('.banner-slider');
slick_el.slick({
    autoplay: true,
    autoplaySpeed: 2000,
    dots: true,
    lazyLoad: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
});
slick_el.slick('slickSetOption', 'autoplay', true, true);
slick_el.slick('slickGoTo',0,false);