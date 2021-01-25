((campaignId) => {
  // Attempt to get the campaign ID
  if(!campaignId) {
    try {
      campaignId = patreon.bootstrap.campaign.data.id;
    } catch(e) {
      console.error('Failed to autodetect campaign id');
    }
  }

  // Verify
  if(!campaignId || campaignId === 'CAMPAIGN_ID') {
    throw new Error('Missing Campaign ID. You can get this by looking at the JSON payload your browser is sending when viewing a post.');
  }

  // Method to generate a URL for downloading files
  const getUrl = (cursor) => {
    const params = {
      "include":"campaign,access_rules,attachments,audio,images,media,poll.choices,poll.current_user_responses.user,poll.current_user_responses.choice,poll.current_user_responses.poll,user,user_defined_tags",
      "fields":{
        "campaign":"currency,show_audio_post_download_links,avatar_photo_url,earnings_visibility,is_nsfw,is_monthly,name,url",
        "post":"change_visibility_at,comment_count,content,current_user_can_comment,current_user_can_delete,current_user_can_view,current_user_has_liked,embed,image,is_paid,like_count,meta_image_url,min_cents_pledged_to_view,post_file,post_metadata,published_at,patreon_url,post_type,pledge_url,thumbnail_url,teaser_text,title,upgrade_url,url,was_posted_by_campaign_owner",
        "post_tag":"tag_type,value",
        "user":"image_url,full_name,url",
        "access_rule":"access_rule_type,amount_cents",
        "media":"id,image_urls,download_url,metadata,file_name"
      },

      "filter": {
        "campaign_id":campaignId,"contains_exclusive_posts":"true","is_draft":"false"
      },

      "sort": "-published_at",
      ...(cursor ? {"page":{ cursor }} : {}),
      "json-api-use-default-includes":"false",
      "json-api-version":"1.0"
    }

    // Method to generate query params (recursively)
    let queryParams = '';
    const addToQuery = (key, value) => {
      queryParams += (queryParams.length?'&':'') + [ key, value ].map(encodeURIComponent).join('=')
    }
    const addObject = (object, prev) => {
      Object.entries(object).forEach((y) => {
        let [ key, value ] = y;

        const realKey = (prev?`${prev}[`:'') + key + (prev?']':'');

        if(typeof value === "object" && !Array.isArray(value)) {
          return addObject(value, realKey);
        }

        addToQuery(realKey, value);
      }, '');
    }
    addObject(params);
    return"https://www.patreon.com/api/posts?" + queryParams;
  }

  // Method to perform fetch itself
  const fetchUrl = (cursor) => fetch(getUrl(cursor), {
    "credentials": "include",
    "headers": {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/vnd.api+json",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache"
    },
    "referrer": `https://www.patreon.com/m/${campaignId}/posts`,
    "method": "GET",
    "mode": "cors"
  });

  // Method to fetch and parse the response (async)
  const fetchAndParse = async (cursor) => {
    const res = await fetchUrl(cursor);
    const data = await res.json();
    const { included, meta } = data;
    const files = included.filter(x => {
      return x.type === 'attachment' && x.attributes && x.attributes.name && x.attributes.url;
    }).map(x => {
      const name = x.attributes.name;
      const url = x.attributes.url;
      return { name, url };
    });

    if(!data.data.length) return null;

    return {
      files, next: meta && meta.pagination && meta.pagination.cursors && meta.pagination.cursors.next ? meta.pagination.cursors.next : null
    };
  }

  // Download method
  const download = async (name, url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const aurl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = aurl;
    a.download = name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(aurl);
  };

  // Runner.
  return (async () => {
    const files = [];
    window.files = files;
    let next = null;
    
    while(true) {
      console.log('Fetching another page...');
      const res = await fetchAndParse(next);
      if(!res) break;
      next = res.next;
      files.push(...res.files);
      if(!next) break;
    };

    for(let i = 0; i < files.length; i++) {
      const f = files[i]
      console.log('Downloading file', f.name);
      await download(f.name, f.url);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  })();
})();