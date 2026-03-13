const yearNode = document.getElementById("year");

if (yearNode) {
    yearNode.textContent = new Date().getFullYear().toString();
}

function pickWithWrap(pool, start, count) {
    if (!pool.length || count <= 0) {
        return [];
    }
    const out = [];
    for (let i = 0; i < count; i += 1) {
        out.push(pool[(start + i) % pool.length]);
    }
    return out;
}

function renderReviewsGrid(listNode, reviews) {
    listNode.innerHTML = reviews
        .map((review) => {
            const reviewRating = Number(review.rating || 0);
            const stars = "★".repeat(Math.max(1, Math.min(5, Math.round(reviewRating))));
            const authorName = review.authorAttribution?.displayName || "Клиент";
            const authorPhoto = review.authorAttribution?.photoUri || "";

            return `
                <div class="review-card">
                    <div class="review-head">
                        <div class="review-author">
                            ${authorPhoto ? `<img class="review-avatar" src="${authorPhoto}" alt="${authorName}">` : ""}
                            <strong>${authorName}</strong>
                        </div>
                        <span>${review.relativePublishTimeDescription || ""}</span>
                    </div>
                    <p>${stars}</p>
                    <p>${review.originalText?.text || review.text?.text || ""}</p>
                </div>
            `;
        })
        .join("");
}

function setupReviewCycler(allReviews) {
    const listNode = document.getElementById("google-reviews");
    const prevBtn = document.getElementById("reviews-prev");
    const nextBtn = document.getElementById("reviews-next");
    if (!listNode || !prevBtn || !nextBtn || !allReviews.length) {
        return;
    }

    const byLengthDesc = [...allReviews].sort((a, b) => {
        const lenA = (a.originalText?.text || a.text?.text || "").length;
        const lenB = (b.originalText?.text || b.text?.text || "").length;
        return lenB - lenA;
    });

    const byLengthAsc = [...allReviews].sort((a, b) => {
        const lenA = (a.originalText?.text || a.text?.text || "").length;
        const lenB = (b.originalText?.text || b.text?.text || "").length;
        return lenA - lenB;
    });

    let longStart = 0;
    let shortStart = 0;
    let direction = 1;

    const renderCurrent = () => {
        const longSet = pickWithWrap(byLengthDesc, longStart, 3);
        const shortSet = pickWithWrap(byLengthAsc, shortStart, 3);
        renderReviewsGrid(listNode, [...longSet, ...shortSet]);
    };

    const step = (delta) => {
        if (byLengthDesc.length > 1) {
            longStart = (longStart + delta + byLengthDesc.length) % byLengthDesc.length;
        }
        if (byLengthAsc.length > 1) {
            shortStart = (shortStart + delta + byLengthAsc.length) % byLengthAsc.length;
        }
        renderCurrent();
    };

    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(1));

    renderCurrent();

    if (allReviews.length > 6) {
        setInterval(() => {
            if (direction === 1 && (longStart >= byLengthDesc.length - 1 || shortStart >= byLengthAsc.length - 1)) {
                direction = -1;
            } else if (direction === -1 && (longStart <= 0 || shortStart <= 0)) {
                direction = 1;
            }
            step(direction);
        }, 5000);
    }
}

async function loadGoogleReviews() {
    const ratingDiv = document.getElementById("google-rating");
    if (!ratingDiv) {
        return;
    }

    const placeId = "ChIJow_rX82ZpkARFvc5NRlpVgM";
    const apiKey = "AIzaSyCnT_KdTLViu_Emj26mSCCYvXSlAy-cQrI";
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,rating,userRatingCount,reviews&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const placeRating = data.rating || "N/A";
        const totalReviews = data.userRatingCount || 0;

        ratingDiv.innerHTML = `
            <p><strong>${data.displayName?.text || "Автомивка Равда - Несебър"}</strong></p>
            <p>⭐ ${placeRating} / 5 · Общо отзиви: ${totalReviews}</p>
        `;

        if (data.reviews && data.reviews.length > 0) {
            const allReviews = data.reviews;
            const bgReviews = allReviews.filter((r) => (r.originalText?.languageCode || r.text?.languageCode || "").startsWith("bg"));
            const otherReviews = allReviews.filter((r) => !(r.originalText?.languageCode || r.text?.languageCode || "").startsWith("bg"));
            const orderedReviews = [...bgReviews, ...otherReviews];
            setupReviewCycler(orderedReviews);
        } else {
            const reviewsDiv = document.getElementById("google-reviews");
            if (reviewsDiv) {
                reviewsDiv.innerHTML = "<p>Все още няма налични отзиви.</p>";
            }
        }
    } catch (error) {
        console.error("Error loading Google reviews:", error);
        const reviewsDiv = document.getElementById("google-reviews");
        if (reviewsDiv) {
            reviewsDiv.innerHTML = "<p>Неуспешно зареждане на отзивите.</p>";
        }
    }
}

loadGoogleReviews();
