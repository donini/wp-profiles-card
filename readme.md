# Welcome to CardPress

Have you considered sharing your public <a href="https://wordpress.org/" target="_blank">WordPress.org</a> profile? You can now present it in a card format that showcases your achievements. This card displays your avatar, name, badges, and more.

<a href="https://cardpress.us/" target="_blank">CardPress</a> was developed for the community to highlight your accomplishments. It creates an image that can be easily shared using a URL or Markdown. Additionally, it fully supports <a href="https://docs.github.com/en/get-started/start-your-journey/setting-up-your-profile#adding-a-profile-readme" target="_blank">GitHub profile pages.</a>

# Features
-   [Accessing Card](#accessing-card)
    -   [Options](#options)

### Accessing Card
To access your card, reach the link below and replace the username with your WordPress profile name.

```md
https://www.cardpress.us/card?username=[YOUR_USERNAME_HERE]
```

If you want to use your card in a markdown file, just copy & paste the code below, by putting your WordPress username into the username variable.

```md
[![Rodrigo's WordPress Activity](https://www.cardpress.us/card?username=rodrigodonini&badges=true)](https://www.cardpress.us/)
```

![CardPress Example](static/images/CardExample.jpg "CardPress Example")


#### Options
- **badges** [true|false] default true: Show / Hide profile badges
- **header** [true|false] default true: Show / Hide header section (avatar, name, username, member since)
- **refresh** [true|false] default false: Refresh profile card content

### TODO LIST
1. ~~Convert badge icons into SVG or dashicons~~ - ✅
2. Displaying Options
    - color (default HEX 000000) - <a href="https://github.com/donini/wp-profiles-card/issues/1" target="_blank">TODO</a> ⌛️
    - foreground color (default HEX ffffff) - <a href="https://github.com/donini/wp-profiles-card/issues/2" target="_blank">TODO</a> ⌛️
    - avatar (default true - [true|false]) - <a href="https://github.com/donini/wp-profiles-card/issues/3" target="_blank">TODO</a> ⌛️
3. Visual Improvements

### REPORT ISSUES & SUGGESTIONS
Bugs or suggestions to improve the tool can be reported <a href="https://github.com/donini/wp-profiles-card/issues/new" target="_blank">here</a>. Check first if it hasn't been <a href="https://github.com/donini/wp-profiles-card/issues" target="_blank">reported</a> yet.

### COLLABORATE
It's our project, it's made for the community, and its source code is stored on <a href="https://github.com/donini/wp-profiles-card" target="_blank">GitHub</a>, check it out. 


### SUPPORT THIS PROJECT
Together, we can keep this service running for the community, and all donations raised will go towards keeping this service running, such as hosting costs. Buy me a coffee ☕️
<script type="text/javascript" src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" data-name="bmc-button" data-slug="cardpress" data-color="#252525" data-emoji=""  data-font="Cookie" data-text="Buy me a coffee" data-outline-color="#ffffff" data-font-color="#ffffff" data-coffee-color="#FFDD00" ></script>