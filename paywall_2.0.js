// Directions: 
// Each client must have or create a paypal business account where they will be able to receive the funds generated from this script.
// Next they must go to https://www.paypal.com/buttons/ to generate a custom HTML pay form linked to that account ("buy now" button recommended).
// **IMPORTANT: In step 3 of generating the form, client must select "Take customers to this URL when they finish checkout" and provide the link to their content page.
// They should then provide the CRO with the HTML of the generated form, who will replace the current form in "popup.innerHTML" with the client's custom form.

let bodyTag = document.getElementsByTagName("body")[0];
let headTag = document.getElementsByTagName("head")[0];

// if a CRO needs content hidden for a custom site (instead of the popup) - this dictionary can be updated with article specific content selectors
// ONLY USE IF ABSOLUTELY NECESSARY (too many sites in here will make the variant too slow)
// format: key = article url; value = article content selector
// Important to make sure the selector is unique to the page
let known_content_selectors = {
    "https://www.jpost.com/breaking-news/evidence-phase-of-netanyahu-trial-postponed-to-february-650139": "#startBannerSticky",
    "https://www.ynetnews.com/article/HkNM8T6vP": "#ArticleBodyComponent > div.textEditor_container.readOnly",
    "https://news.microsoft.com/features/how-thousands-people-disabilities-shape-technology-you-probably-use-every-day/": "#main > div.features-body",
};

// true once author Byline is found (used for sort_textNodesUnder function)
let start_tagging = false;
// true once sort_textNodesUnder function hides text
let hidden_from_Byline = false;



function check_known_selectors() {
    let site = window.location.href;
    if (known_content_selectors[site]) {
        let tw_selector = known_content_selectors[site];
        let content = document.querySelectorAll(tw_selector)[0];
        if (content && content.innerText.length > 0) {
            console.log("[+] Known site detected - hiding content...");
            // split content by paragraph:
            let lineBreak_list = content.innerText.split("\n");
            // hide content shown on page:
            content.innerText = '';
            let count = 0;
            // display first paragraph normal, second blurred:
            for (let l of lineBreak_list) {
                if (count < 1) {
                    let p = document.createElement("p");
                    p.innerText = l;
                    content.appendChild(p);
                    count += 1;
                } else if (count == 1) {
                    let p = document.createElement("p");
                    p.innerText = l + "...";
                    p.style.opacity = 0.35;
                    p.classList.add("tw-pop-target");
                    content.appendChild(p);
                    count += 1;
                } else {
                    break;
                }
            }
            return true;
        } else {
            console.log("[-] Article content not found - recheck the known_content_selector...");
            return false;
        }
    } else {
        console.log("[-] Site selector unknown to Twik. Continuing to check for wordpress...");
        return false;
    }
}


function check_for_wordpress() {
    let head_html = headTag.innerHTML;
    if (head_html.includes("wordpress")) {
        // common WP content class names can be added here to check for various site structures:
        let potential_classes = ["entry-content", "vy-cx-page-content ", "page-content"];
        let content;
        // search common WP content class names to try to find article body:
        for (let p of potential_classes) {
            content = document.getElementsByClassName(p)[0];
            if (content && content.innerText.length > 0) {
                break;
            }
        }
        if (content && content.innerText.length > 0) {
            // content found
            console.log("[+] Wordpress site detected - hiding content...");
            // split content by paragraph:
            let lineBreak_list = content.innerText.split("\n");
            // hide content shown on page:
            content.innerText = '';
            let count = 0;
            // display first paragraph normal, second blurred:
            for (let l of lineBreak_list) {
                if (count < 1) {
                    let p = document.createElement("p");
                    p.innerText = l;
                    content.appendChild(p);
                    count += 1;
                } else if (count == 1) {
                    let p = document.createElement("p");
                    p.innerText = l + "...";
                    p.style.opacity = 0.35;
                    p.classList.add("tw-pop-target");
                    content.appendChild(p);
                    count += 1;
                } else {
                    break;
                }
            }
            return true;
        } else {
            console.log("[-] Wordpress content not found...");
            return false;
        }
    } else {
        console.log("[-] Wordpress not detected");
        return false;
    }
}


// searches page for author Byline, then tags every subsequent text node with "tw-TAGGED"
function sort_textNodesUnder(node){
    var all = [];
    for (node=node.firstChild;node;node=node.nextSibling){
        if (node.nodeType==3) {
            let tw_text = node.textContent;
            let re = /(^by)/gi;
            // check for Byline:
            if (re.test(tw_text) == true) {
                let re_2 = /(using|terms|agree|policy)/gi;
                // exclude false Bylines:
                if (re_2.test(tw_text) == false) {
                    node.parentElement.classList.add("tw-Byline");
                    // Byline found, start tagging nodes underneath:
                    start_tagging = true;
                }
            }
            if (start_tagging == true) {
                node.parentElement.classList.add("tw-TAGGED");
            }
            all.push(node);
        } else {
            all = all.concat(sort_textNodesUnder(node));
        }
    }
    return all;
}


function run_popup() {
    headTag.appendChild(custom_style);
    bodyTag.appendChild(popup);
}


function run_alter_temp() {
    let pop_div = document.createElement("div");
    pop_div.style.height = "400px";
    pop_div.style.width = "400px";
    pop_div.style.border = "2px solid black";
    pop_div.innerText = "Daniel's design goes here";

    let last_div = document.querySelectorAll(".tw-pop-target")[0];
    last_div.appendChild((pop_div));
}


let custom_style = document.createElement("style");
// css for "popup":
custom_style.innerHTML = `
    #blur {
        z-index: 100;
        width: 100vw;
        height: 100vh;
        background-color: rgb(0,0,0);
        opacity: 0.94;
        position: fixed;
        top: 0;
        left: 0;
    }

    #pop-wrap {
        z-index: 150;
        width: 100vw;
        height: 100vh;
        opacity: 1;
        position: fixed;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #content {
        z-index: 200;
        width: 85vw;
        height: 85vh;
        opacity: 1;
        display: block;
        background-image: 
            linear-gradient(
            rgba(0, 0, 0, 0.5),
            rgba(0, 0, 0, 0.5)
            ),
            url("https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80");
        background-repeat: no-repeat;
        background-size: cover;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .pop_p {
        font-family: 'Roboto', sans-serif;
        text-align: center;
    }

    .head {
        font-size: 3.5em;
        color: rgb(255,255,255);
        font-weight: bold;
        margin-bottom: 30px;
    }

    .subhead {
        font-size: 1.3em;
        color: rgb(255,255,255);
        margin-bottom: 50px;
    }

    #no_thanks {
        margin-top: 20px;
        background: none;
    }

    #n_t_link {
        color: rgb(255,255,255);
        text-decoration: underline;
        font-size: 0.75em;
    }
`;


// build popup/content blocker:
let popup = document.createElement("div");
// **CRO TO REPLACE the separated paypal form below with client's custom generated form
popup.innerHTML = `
    <div id="blur"></div>

    <div id="pop-wrap">
        <div id="content">
            <p class="pop_p head">Digital subscription required!</p>
            <p class="pop_p head">[Daniel's design goes here]</p>
            <p class="pop_p subhead">Click below for a special offer, starting at just NIS 4.90 for the first month!</p>



            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                <input type="hidden" name="cmd" value="_s-xclick">
                <input type="hidden" name="hosted_button_id" value="JDAD9QW5YX94C">
                <input type="image" src="https://www.paypalobjects.com/en_US/IL/i/btn/btn_buynowCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
                <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
            </form>



            <div id="no_thanks">
                <a id="n_t_link" href="javascript:history.back()">No thanks</a>
            </div>
        </div>
    </div>
`;


// run script:
var prev_page = document.referrer;
if (prev_page == "https://www.paypal.com/") {
    // store that user has paid in local storage (so it can be accessed across sessions)
    localStorage.setItem("tw-paid", "paid");
    console.log("[+] Purchase recorded - content released");
} else {
    // check local storage for paid attribute
    let pay_status = localStorage.getItem("tw-paid");
    if (pay_status == "paid") {
        console.log("[+] Prior purchase confirmed - content released");
    } else {
        // content must be hidden/blocked

        // check for known/pre-specified selectors
        let known_article = check_known_selectors();
        if (known_article == true) {
            // ***DISPLAY daniel alter's design here if site is known
            run_alter_temp();
        }

        if (known_article == false || known_article == undefined) {
            // unknown site, continue to check for wordpress sites:
            let wp = check_for_wordpress();
            if (wp == true) {
                // ***DISPLAY daniel alter's design here if wp
                run_alter_temp();
            }

            if (wp == false || wp == undefined) {
                // site unknown and non-wordpress:

                // searches page for author Byline, then tags every subsequent text node with "tw-TAGGED"
                sort_textNodesUnder(document.body);

                // search all "tw-TAGGED" and hide their text content
                let tw_tags = document.querySelectorAll(".tw-TAGGED");
                for (let t in tw_tags) {
                    if (t == 8) {
                        tw_tags[t].classList.add("tw-pop-target");
                        tw_tags[t].style.opacity = 0.35;
                    } else if (t > 8) {
                        // leave a few nodes in to preview:
                        tw_tags[t].innerText = "";
                        hidden_from_Byline = true;
                    }
                }
                if (hidden_from_Byline = true) {
                    console.log("[+] Byline detected - hiding content...");
                    


                    // then get last DIV with class tw-TAGGED and append to it:
                    // ***DISPLAY daniel alter's design here if wp
                    run_popup();
                    

                } else {
                    // if nothing else was successful, run popup blocker (displayed 2 seconds after page load)
                    console.log("[-] No purchase records, known selectors or Bylines found - preparing paywall");
                    setTimeout(run_popup, 2000);
                }
            }
        }
    }
}
