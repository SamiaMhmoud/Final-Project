const posts = document.querySelector(".posts"),
    usernameInput = document.querySelector("#username-input"),
    passwordInput = document.querySelector("#password-input"),
    registerusernameInput = document.querySelector("#register-username-input"),
    registerpasswordInput = document.querySelector("#register-password-input"),
    registerImageInput = document.querySelector("#register-image-input"),
    registerNameInput = document.querySelector("#register-name-input"),
    loginDiv = document.querySelector("#login-Div"),
    registerBtn = document.querySelector(".register-btn"),
    logoutDiv = document.querySelector("#logout-Div"),
    add = document.querySelector(".add"),
    postInfoContainer= document.querySelector("#post-info-container"),
    userProfileContainer = document.querySelector(".user-profile-container"),
    mainContainer = document.querySelector(".main-container"),
    profilePage = document.querySelector(".profile-page"),
    homePage = document.querySelector(".home-page"),
    baseUrl = "https://tarmeezacademy.com/api/v1";

let commentsContainer = document.getElementById("comments");
    postInfo = document.querySelector("#post-info"),
    currentPage = 1,
    lastPage = 1;

setupUi();

getPosts();

function getPosts(page) {
    toggleLoader(true);
    axios
        .get(`${baseUrl}/posts?page=${page}&limit=5`)
        .then((response) => {
            lastPage = response.data.meta.last_page;
            response.data.data.forEach((post) => {
                postDomCreater(post, posts);
            });
        })
        .catch((error) => {
            console.log(error);
            const massage = error.response.data.message;
            showAlert(massage, "danger");
        })
        .finally(()=> {
            toggleLoader(false);
        })
}

function loginBtnClicked() {
    const username = usernameInput.value,
        password = passwordInput.value;
    toggleLoader(true);
    axios
        .post(`${baseUrl}/login`, {
            username: `${username}`,
            password: `${password}`,
        })
        .then((respons) => {
            let token = respons.data.token;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(respons.data.user));
            const modal = document.getElementById("login-modal")
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            showAlert("Logged in successfully", "primary");
            userInfo();
        })
        .catch((error) => {
            const massage = error.response.data.message;
            showAlert(massage, "danger");
        })
        .finally(()=> {
            setupUi();
            toggleLoader(false);
        })
}

function registerBtnClicked() {
    toggleLoader(true);
    const registerusername = registerusernameInput.value,
        registerpassword = registerpasswordInput.value,
        registerImage = registerImageInput.files[0],
        registerName = registerNameInput.value;
    
    let formData = new FormData();

    formData.append("username", registerusername);
    formData.append("name", registerName);
    formData.append("password", registerpassword);
    formData.append("image", registerImage);

    axios
    .post(`${baseUrl}/register`, formData)
    .then((response) => {
        let token = response.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        const modal = document.getElementById("register-modal");
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        showAlert("Register in successfully", "primary");
        setupUi();
        userInfo();
    })
    .catch((error) => {
        const massage = error.response.data.message;
        showAlert(massage, "danger");
    })
    .finally(()=> {
        toggleLoader(false);
    })
}

function createPostClicked() {
    toggleLoader(true);
        const title = document.getElementById("new-post-title").value,
            postBody = document.getElementById("new-post-body").value,
            postImage = document.getElementById("new-post-image").files[0],
            token = localStorage.getItem("token");
        let postId = document.getElementById("post-id-input").value,
            isCreate = postId == null || postId == "",
            url = '';

        let formData = new FormData();
        formData.append("title", title);
        formData.append("body", postBody);
        formData.append("image", postImage);

        let config = {
            headers:{
                "Content-Type": "multipart/form-data",
                "authorization" : `Bearer ${token}`
            }
        }
        if(isCreate) {
            url = `${baseUrl}/posts`;
        }else {
            formData.append("_method", "put");
            url = `${baseUrl}/posts/${postId}`
        }
        axios.post(`${url}`, formData, config)
            .then((response) => {
                const modal = document.getElementById("add-modal");
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
                getPosts();
                showAlert("Post Has Been Created successfully", "primary");
            })
            .catch((error) => {
                const massage = error.response.data.message;
                showAlert(massage, "danger");
                console.log(error.response.data.message);
            })
            .finally(()=> {
                toggleLoader(false);
            })
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setupUi();
    showAlert("Logged out successfully","primary");
}

function setupUi() {
    if (localStorage.getItem("token") !== null) {
        loginDiv.classList.add("hide");
        logoutDiv.classList.remove("hide");
        add.classList.remove("hide");
    } else {
        loginDiv.classList.remove("hide");
        logoutDiv.classList.add("hide");
        add.classList.add("hide");
    }
}

function showAlert(customMassage,type) {
    // const alertPlaceholder = document.querySelector("#success-alert");
    const alertPlaceholder = document.createElement("div");
    alertPlaceholder.className = "show fade";
    alertPlaceholder.id = "success-alert";
    const alert = (message, type) => {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert" style="padding:12px 20px">`,
        `   <div>${message}</div>`,
        "</div>",
        ].join("");

        alertPlaceholder.append(wrapper);
        document.querySelector(".alert-container").append(alertPlaceholder);
    };

    alert(customMassage, type);

    setTimeout(() => {
        const alertTohide = bootstrap.Alert.getOrCreateInstance("#success-alert");
        alertTohide.close();
    }, 2000);
}

window.addEventListener('scroll', () => {
    const {
        scrollTop,
        scrollHeight,
        clientHeight
    } = document.documentElement;

    if (
        scrollTop + clientHeight >= scrollHeight - 5 &&
        currentPage <= lastPage) {
            console.log("end")
        currentPage++;
        getPosts(currentPage);
    }
})

function userInfo() {
    let user = JSON.parse(localStorage.getItem("user"));
    document.querySelector(".nav-user-profile").src = user.profile_image;
    document.querySelector(".user-info span").innerHTML = user.username;
}
userInfo();

function showPost(id) {
    toggleLoader(true);
    postInfo.innerHTML="";
    axios
        .get(`${baseUrl}/posts/${id}`)
        .then((response) => {
            removeHide(mainContainer, userProfileContainer,postInfoContainer)
            const postDetails = response.data.data;
            postDomCreater(postDetails, postInfo);
            showComments(postDetails.comments);
            addComment(id);
        })
        .catch((error) => {
            console.log(error)
            const massage = error.response.data.message;
            showAlert(massage, "danger");
        })
        .finally(()=> {
            toggleLoader(false);
        });
}

function currentUser() {
    if(localStorage.getItem("user") !== null) {
        return JSON.parse(localStorage.getItem("user"));
    }else {
        return null;
    }
}

function postDomCreater(post, container) {
    let postTitle = "",
        tags = "";
    post.tags.forEach((tag) => {
        tags += `
                <span>${tag.name}</span>
                `;
    });
    if (post.title != null) {
        postTitle = post.title;
    }

  // Show or hide edit btn
    let user = currentUser();
    let isMyPost = user !== null && user.id == post.author.id;
    let editBtnContent = ``;
    let deleteBtnContent = ``;
    if (isMyPost) {
        editBtnContent =`<button class="btn edit-btn"onclick="editPostBtnClicked('${encodeURIComponent(
        JSON.stringify(post)
        )}')">edit</button>`;

        deleteBtnContent = `<button class="btn btn-danger" onclick="deletePostBtnClicked(${post.id})">delete</button>`;
    }

    container.innerHTML += `
            <div class="post card mb-4 border border-0">
                    <div class="post-header card-header d-flex align-items-center p-2 px-3 justify-content-between">
                    <div class="d-flex align-items-center">
                    <img src="${post.author.profile_image}" alt="User" class="rounded-circle border border-1 mx-2"id="profile_image">
                    <h5 id="name" style="cursor: pointer;" onclick="showUserProfile(${post.author.id})">${post.author.username}</h5>
                    </div>
                    <div>
                        ${editBtnContent}
                        ${deleteBtnContent}
                    </div>
                    </div>
                    <div class="card-body" id="post-body" onclick="showPost(${post.id})">
                        <img class="w-100" src="${post.image}" alt="">
                        <h6 class="mt-2">${post.created_at}</h6>
                        <h5>${postTitle}</h5>
                        <p class="pb-2">${post.body}</p>
                        <div id="comments-counts">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
                            </svg>
                            <span >${post.comments_count} Comments</span>
                            <span id="tags">${tags}</span>
                        </div>
                    </div>
                </div>
            `;
}

function showComments(comments) {
    commentsContainer.innerHTML ="";
    comments.forEach( comment =>{
        commentsContainer.innerHTML += `
        <div class="comment-details">
            <div class="comment-author d-flex align-items-center">
            <img src="${comment.author.profile_image}" alt="" class="rounded-circle border border-1 mx-2">
            <h5>${comment.author.username}</h5>
            </div>
            <div class="comment-body">
                <p>${comment.body}</p>
            </div>
            </div>
        </div>
        
        `;
    })
}

function removeHide(element1,element2,element3) {
    element1.classList.add("hide");
    element2.classList.add("hide");
    element3.classList.remove("hide");
}

function active(element1,element2) {
    element1.classList.add("active");
    element2.classList.remove("active");
}

function addComment(id) {
    toggleLoader(true);
    document.querySelector(".comment-btn").onclick = () => {
        let commentBody = document.querySelector("#add-comment input").value,
        token = localStorage.getItem("token");
        
        let config = {
        headers: {
            "Content-Type": "multipart/form-data",
            authorization: `Bearer ${token}`,
        },
        };
        axios
        .post(`${baseUrl}/posts/${id}/comments`, {
            "body": `${commentBody}`,
        },config)
        .then((response) => {
            console.log(response)
            showPost(id);
            showAlert("Comment Added successfully", "primary");
        })
        .catch((error) => {
            const massage = error.response.data.message;
            showAlert(massage, "danger");
        })
        .finally(()=> {
            toggleLoader(false);
        });
    }
}

function editPostBtnClicked(postObj) {
    let post = JSON.parse(decodeURIComponent(postObj))
    document.getElementById("post-id-input").value = post.id;
    document.getElementById("new-post-title").value = post.title;
    document.getElementById("new-post-body").value = post.body;
    document.getElementById("post-modal-title").innerHTML = "Edit Post";
        document.getElementById("post-modal-submit-btn").innerHTML = "Update";
    let postModal = new bootstrap.Modal(document.getElementById("add-modal"),{});
    postModal.toggle();
}

function addBtnClicked() {
    document.getElementById("post-id-input").value = '';
    document.getElementById("new-post-title").value = '';
    document.getElementById("new-post-body").value = '';
    document.getElementById("post-modal-title").innerHTML = "Create A New Post";
    document.getElementById("post-modal-submit-btn").innerHTML = "Create";
    let postModal = new bootstrap.Modal(document.getElementById("add-modal"),{});
    postModal.toggle();
}

function deletePostBtnClicked(id) {
    document.getElementById("delete-post-id").value = id;
    let postModal = new bootstrap.Modal(
        document.getElementById("delete-modal"),
        {}
    );
    postModal.toggle();

}

function ConfirmDelete(){
    toggleLoader(true);
    const id = document.getElementById("delete-post-id").value;
    const token = localStorage.getItem("token");
    let config = {
        headers: {
            "Content-Type": "multipart/form-data",
            authorization: `Bearer ${token}`,
        },
    };
    axios
    .delete(`${baseUrl}/posts/${id}`, config)
    .then((response) => {
        const modal = document.getElementById("delete-modal");
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        getPosts();
        showAlert("Post Has Been Deleted", "primary");
    })
    .catch((error) => {
        console.log(error);
        const massage = error.response.data.message;
        showAlert(massage, "danger");
    })
    .finally(()=> {
        toggleLoader(false);
    })
}

function showUserProfile(id) {
    toggleLoader(true);
    const userId = id;
        axios
            .get(`${baseUrl}/users/${userId}`)
            .then((response) => {
                removeHide(mainContainer,postInfoContainer,userProfileContainer);
                active(profilePage,homePage);
                document.getElementById("profile-username").innerHTML =
                    response.data.data.username;
                document.getElementById("profile-name").innerHTML =
                    response.data.data.name;
                document.querySelector(".user-profile-img").src =
                    response.data.data.profile_image;

                if(response.data.data.posts_count)
                document.querySelector("#number-of-posts").innerHTML = response.data.data.posts_count;
                else  document.querySelector("#number-of-posts").innerHTML = '0'

                if (response.data.data.comments_count)
                    document.querySelector("#number-of-comments").innerHTML =
                    response.data.data.comments_count;
                else document.querySelector("#number-of-comments").innerHTML = "0";

                document.querySelector(".auther-username").innerHTML =  response.data.data.name +`'s`;
                axios
                .get(`${baseUrl}/users/${userId}/posts`)
                .then((response) => {
                    let userPosts = document.getElementById("user-posts");
                    userPosts.innerHTML = "";
                    response.data.data.forEach((post) => {
                        postDomCreater(post, userPosts);
                    });
                    // postDomCreater(post, container)
                })
                .catch((error) => {
                console.log(error);
                const massage = error.response.data.message;
                showAlert(massage, "danger");
                });
            })
            .catch((error) => {
                console.log(error);
                const massage = error.response.data.message;
                showAlert(massage, "danger");
            })
            .finally(()=> {
                toggleLoader(false);
            })
}

profilePage.onclick = () => {
    let id= currentUser().id;
    showUserProfile(id);
}

function toggleLoader(show = true) {
    let loader = document.querySelector(".loader");
    if(show) {
        loader.style.display = "flex";
    } else {
        loader.style.display = "none";
    }

}