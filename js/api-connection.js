$(document).ready(function () {
    $("#buscar").click(function () {
        let query = $("#query").val().trim();
        if (query === "") {
            alert("Por favor, escribe algo para buscar.");
            return;
        }

        const apiUrl = `https://twitter-x.p.rapidapi.com/search/?query=${encodeURIComponent(query)}&section=top&limit=20`;
        const settings = {
            async: true,
            crossDomain: true,
            url: apiUrl,
            method: 'GET',
            headers: {
                'x-rapidapi-key': '18468dc8a4mshbe36a22646a6722p152df8jsnc101d7fe71e4',
                'x-rapidapi-host': 'twitter-x.p.rapidapi.com'
            }
        };

        $.ajax(settings)
            .done(function (response) {
                let tweetsHTML = "";
                if (response?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions) {
                    response.data.search_by_raw_query.search_timeline.timeline.instructions.forEach(instruction => {
                        if (instruction.type === "TimelineAddEntries") {
                            instruction.entries.forEach(entry => {
                                if (entry.content?.entryType === "TimelineTimelineItem" && entry.content.itemContent?.tweet_results) {
                                    const tweetData = entry.content.itemContent.tweet_results.result;
                                    if (!tweetData || !tweetData.core || !tweetData.core.user_results || !tweetData.legacy) return;
                                    if (tweetData.legacy.in_reply_to_status_id_str) return;
                                    if (tweetData.legacy.extended_entities?.media?.some(media => media.type === "video" || media.type === "animated_gif")) return;

                                    const user = tweetData.core.user_results?.result?.legacy || {};
                                    const tweetText = tweetData.legacy.full_text?.replace(/https?:\/\/t\.co\/\S+/g, "") || "Texto no disponible";
                                    const likes = tweetData.legacy.favorite_count || 0;
                                    const retweets = tweetData.legacy.retweet_count || 0;
                                    const replies = tweetData.legacy.reply_count || 0;
                                    const profileImage = user.profile_image_url_https?.replace("_normal", "") || "default.png";
                                    const screenName = user.screen_name || "Desconocido";
                                    const name = user.name || "Usuario Anónimo";
                                    const tweetUrl = `https://twitter.com/${screenName}/status/${tweetData.legacy.id_str}`;
                                    const tweetId = tweetData.legacy.id_str;

                                    let mediaHTML = "";
                                    if (tweetData.legacy.entities?.media) {
                                        tweetData.legacy.entities.media.forEach(media => {
                                            if (media.type === "photo") {
                                                mediaHTML += `<img src="${media.media_url_https}" class="tweet-image img-fluid" alt="Imagen adjunta">`;
                                            }
                                        });
                                    }

                                    tweetsHTML += `
                                        <div class="tweet card p-3 mb-3" data-tweet-id="${tweetId}" data-tweet-text="${tweetText}" 
                                            data-tweet-user="${name}" data-tweet-handle="${screenName}" data-tweet-profile="${profileImage}" 
                                            data-tweet-likes="${likes}" data-tweet-retweets="${retweets}" data-tweet-replies="${replies}" data-tweet-media="${mediaHTML}">
                                            <div class="inside">
                                                <div class="d-flex">
                                                    <img src="${profileImage}" alt="Imagen de ${name}" class="rounded-circle me-2" width="50">
                                                    <div>
                                                        <h5 class="mb-0">${name}</h5>
                                                        <small class="text-muted">@${screenName}</small>
                                                    </div>
                                                </div>
                                                <p class="mt-2">${tweetText}</p>
                                                ${mediaHTML}
                                                <div class="d-flex justify-content-between text-muted mt-2">
                                                    <span>❤️ ${likes}</span>
                                                    <span>🔄 ${retweets}</span>
                                                    <span>🗨️ ${replies}</span>
                                                </div>
                                            </div>
                                            <a href="${tweetUrl}" target="_blank" class="btn btn-primary btn-sm mt-2">🔗 Ver en Twitter</a>
                                        </div>
                                    `;
                                }
                            });
                        }
                    });
                }
                
                $("#resultado").html(tweetsHTML || "<p class='text-center'>No se encontraron tweets sin GIFs ni videos.</p>");
            })
            .fail(function (error) {
                console.error("Error en la petición:", error);
                $("#resultado").html("<p class='text-danger text-center'>Error al obtener los tweets.</p>");
            });
    });

    $(document).on("click", ".inside", function () {
        let tweetHTML = $(this).html();
        mostrarModalTweet(tweetHTML);
    });

    function mostrarModalTweet(tweetHTML) {
        $("#modalBody").html(tweetHTML);
        let modal = new bootstrap.Modal(document.getElementById("tweetModal"));
        modal.show();
    }
});