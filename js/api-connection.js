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
                                    if (!tweetData || !tweetData.core || !tweetData.core.user_results || !tweetData.legacy) {
                                        return;
                                    }
                                    if (tweetData.legacy.in_reply_to_status_id_str) {
                                        return;
                                    }
                                    if (tweetData.legacy.extended_entities?.media) {
                                        const tieneGifOVideo = tweetData.legacy.extended_entities.media.some(media =>
                                            media.type === "video" || media.type === "animated_gif"
                                        );
                                        if (tieneGifOVideo) {
                                            return;
                                        }
                                    }

                                    const user = tweetData.core.user_results?.result?.legacy || {};
                                    const tweetText = tweetData.legacy.full_text
                                        ? tweetData.legacy.full_text.replace(/https?:\/\/t\.co\/\S+/g, "")
                                        : "Texto no disponible";
                                    const likes = tweetData.legacy.favorite_count || 0;
                                    const retweets = tweetData.legacy.retweet_count || 0;
                                    const replies = tweetData.legacy.reply_count || 0;
                                    const profileImage = user.profile_image_url_https ? user.profile_image_url_https.replace("_normal", "") : "default.png";
                                    const screenName = user.screen_name || "Desconocido";
                                    const name = user.name || "Usuario Anónimo";
                                    const tweetUrl = `https://twitter.com/${screenName}/status/${tweetData.legacy.id_str}`;

                                    let mediaHTML = "";
                                    if (tweetData.legacy.entities?.media) {
                                        tweetData.legacy.entities.media.forEach(media => {
                                            if (media.type === "photo") {
                                                mediaHTML += `<img src="${media.media_url_https}" class="tweet-image" alt="Imagen adjunta">`;
                                            }
                                        });
                                    }

                                    tweetsHTML += `
                                        <div class="tweet">
                                            <img src="${profileImage}" alt="Imagen de ${name}" class="profile-pic">
                                            <div class="tweet-content">
                                                <h3>${name} <span>@${screenName}</span></h3>
                                                <p>${tweetText}</p>
                                                ${mediaHTML} <!-- Muestra la imagen si existe -->
                                                <div class="tweet-info">
                                                    ❤️ ${likes}  🔄 ${retweets}  🗨️ ${replies}
                                                </div>
                                                <a href="${tweetUrl}" target="_blank" class="tweet-link">🔗 Ver en Twitter</a>

                                            </div>
                                        </div>
                                    `;
                                }
                            });
                        }
                    });
                }

                $("#resultado").html(tweetsHTML || "<p>No se encontraron tweets sin GIFs ni videos.</p>");
            })
            .fail(function (error) {
                console.error("Error en la petición:", error);
                $("#resultado").text("Error al obtener los tweets.");
            });
    });
});
