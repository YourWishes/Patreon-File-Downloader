# Patreon File Downloader
Simple tool that will scrape a patreon campaign and start downloading each file
in the campaign. Useful for certain types of Patreons, e.g. Music, Videos, etc.

## How to use
1. View a post made by the user you wish to download from.
2. Copy and paste the contents of `download.js` from this repository into your
browsers' console. For some browsers you may have to allow pasting before you
are able to do this.
3. Run the script, the script will start by fetching every post associated to 
the campaign you are viewing. Once done it will download each attachment it can
detect.

## Notes
This script works on a campaign ID, I really don't know or care much about what
this is, but it seems to be related to the campaign you subscribed to and is 
associated to a user as well as the posts for that user.

The script will attempt to jack the campaign ID off the window object and use it.
If for some reason it can't you can supply it manually by providing it to the
script yourself (mod the code).

This script also relies on simply making fetch calls within the browser, so it
isn't the most reliable thing in the world.

As for actual downloading, this is achieved by simply opening the url in a new
tab to trigger the download sequence.

## Can I ... ?
Probably not, since Patreon likely authenticates with some kind of session token
we just use the fact that the browser would already be authenticated with that
token in order to make the requests. I really didn't spend any time looking into
it but that's my best guess.

## LICENSE
Licensed under MIT, feel free to copy, modify, distribute and use code as you
see fit, however no warranty is provided.