const fs = require('fs');
const http = require('https');

/**
 * 
 * @param {WordPress profile username} username 
 * @param {Real name} name 
 * @param {User initials} initials 
 * @param {Date of membership} membersince 
 * @param {Avatar code in 64} avatar64 
 * @param {Formatted badges list} badges 
 * @param {Dynamic height value for the card based on content} dynHeight 
 * @param {Display header section} displayHeader 
 * @param {Header color} headerColor
 * @param {Name color} nameColor
 * @param {Subheader color} subHeaderColor
 * @param {Badge label color} badgeLabelColor
 * @param {Foreground color} foreground
 * @param {Link to the user profile} linkProfile
 * @param {Display avatar} displayAvatar

 * @returns SVG code with the user profile card
 */
function renderCard(username, name, initials, membersince, avatar64, badges, dynHeight, displayHeader, headerColor, nameColor, subHeaderColor, badgeLabelColor, foreground, linkProfile, displayAvatar) {

	let htmlResult =  `
<svg width="500" height="${dynHeight}" viewBox="0 0 500 ${dynHeight}" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
<title property="dc:title">${name} Profile</title>
<style type="text/css" >
<![CDATA[
svg .card-box {
	fill: #${foreground};
}
.name {
    font: 700 20px 'Segoe UI', Ubuntu, Sans-Serif;
    fill: #${nameColor};
    animation: fadeInAnim 0.8s ease-in-out forwards;
}
.subtitle {
    font: 700 14px 'Segoe UI', Ubuntu, Sans-Serif;
    fill: #${headerColor};
}
.subheader {
    font: 500 16px 'Segoe UI', Ubuntu, Sans-Serif;
    fill: #${subHeaderColor};
    animation: fadeInAnim 0.8s ease-in-out forwards;
}
.initials {
    font: 700 40px 'Segoe UI', Ubuntu, Sans-Serif;
    fill: #${nameColor};
}
.achievement {
    opacity: 0;
    animation: fadeInAnim 0.3s ease-in-out forwards;
}
.label {
    font: 600 12px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif;
    fill: #${badgeLabelColor};
}

@keyframes fadeInAnim {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
.badge-unknown circle {
	fill: white;
	stroke: rgb(199, 199, 199);
	stroke-width: 3px;
}
.badge-unknown svg path {
	fill: rgb(199, 199, 199);
}

.badge-core-ai-team circle,
.badge-core-ai-contributor circle {
    fill: white;
	stroke: rgb(122, 0, 223);
	stroke-width: 3px;
}
.badge-core-ai-team circle {
	fill: rgba(122, 0, 223, 0.25);
}
.badge-core-ai-team svg path,
.badge-core-ai-contributor svg path {
	fill: rgb(122, 0, 223)
}

.badge-media-corps-contributor circle {
	fill: white;
}
.badge-media-corps-team circle {
	background: rgba(19, 159, 148, 0.25);
}
.badge-media-corps-team,
.badge-media-corps-contributor {
	stroke: rgb(19, 159, 148);
	stroke-width: 3px;
}
.badge-media-corps-team svg path,
.badge-media-corps-contributor svg path {
	fill: rgb(19, 159, 148);
}

.badge-themes circle {
	fill: white;
}
.badge-themes-reviewer circle {
	fill: rgba(78, 50, 136, 0.25);
}

.badge-themes circle,
.badge-themes-reviewer circle {
	stroke: rgb(78, 50, 136);
	stroke-width: 3px;
}
.badge-themes svg path,
.badge-themes-reviewer svg path {
	fill: rgb(78, 50, 136);
}

.badge-credits-mentor circle {
	stroke: rgb(131, 41, 277);
	stroke-width: 3px;
}
.badge-credits-mentor svg path {
	fill: rgb(131, 41, 277);
}

.badge-credits-graduate circle {
	stroke: rgb(174, 71, 242);
	stroke-width: 3px;
}
.badge-credits-graduate svg path {
	fill: rgb(174, 71, 242);
}

.badge-campus-connect-participant circle {
	stroke: rgb(56, 88, 233);
	stroke-width: 3px;
}
.badge-campus-connect-participant svg path {
	fill: rgb(56, 88, 233);
}

.badge-sustainability-team circle,
.badge-sustainability-contributor circle {
    fill: white;
    stroke: rgb(23, 127, 106);
	stroke-width: 3px;
}
.badge-sustainability-team  svg path,
.badge-sustainability-contributor svg path {
	fill: rgb(23, 127, 106);
}

.badge-wordcamp-volunteer circle {
	fill: white;
	stroke: rgb(247, 173, 67);
	stroke-width: 3px;
}
.badge-wordcamp-volunteer svg path {
	fill: rgb(247, 173, 67)
}



.badge-plugins-reviewer circle {
	fill: rgba(240, 103, 35, 0.25);
}
.badge-plugins circle {
	fill: white;
}
.badge-plugins-reviewer circle,
.badge-plugins circle {
	stroke: rgb(240, 103, 35);
	stroke-width: 3px;
}
.badge-plugins-reviewer svg path,
.badge-plugins svg path {
	fill: rgb(240, 103, 35);
}

.badge-community circle {
	fill: rgba(17, 121, 157, 0.25);
}
.badge-community-contributor circle {
	fill: white;
}
.badge-community circle,
.badge-community-contributor circle {
	stroke: rgb(17, 121, 157);
	stroke-width: 3px;
}
.badge-community svg path,
.badge-community-contributor svg path {
	fill: rgb(17, 121, 157);
}

.badge-meta circle {
	fill: rgba(174, 173, 173, 0.25);
}
.badge-meta-contributor circle {
	fill: white;
}
.badge-meta circle,
.badge-meta-contributor circle {
	stroke: rgb(174, 173, 173);
	stroke-width: 3px;
}
.badge-meta svg path,
.badge-meta-contributor svg path {
	fill: rgb(174, 173, 173);
}

.badge-code-committer circle {
	fill: rgba(205, 0, 0, 0.25);
}
.badge-code circle {
	fill: white;
}
.badge-code-committer circle,
.badge-code circle {
	stroke: rgb(205, 0, 0);
	stroke-width: 3px;
}
.badge-code-committer svg path,
.badge-code svg path {
	fill: rgb(205, 0, 0);
}

.badge-support circle {
	fill: rgba(51, 180, 206, 0.25);
}
.badge-support-contributor circle {
	fill: white;
}
.badge-support circle,
.badge-support-contributor circle {
	stroke: rgb(51, 180, 206);
	stroke-width: 3px;
}
.badge-support svg path,
.badge-support-contributor svg path {
	fill: rgb(51, 180, 206);
}

.badge-wordpress-tv circle {
	fill: rgba(115, 173, 48, 0.25);
}
.badge-wordpress-tv-contributor circle {
	fill: white;
}
.badge-wordpress-tv circle,
.badge-wordpress-tv-contributor circle {
	stroke: rgb(115, 173, 48);
	stroke-width: 3px;
}
.badge-wordpress-tv svg path,
.badge-wordpress-tv-contributor svg path {
	fill: rgb(115, 173, 48);
}

.badge-playground-contributor circle {
	fill: white;
    stroke: #3858E9;
	stroke-width: 3px;
}
.badge-playground-contributor svg path {
	fill: #3858E9;
}

.badge-organizer circle {
	fill: white;
	stroke: rgb(247, 173, 67);
	stroke-width: 3px;
}
.badge-organizer svg path {
	fill: rgb(247, 173, 67);
}

.badge-speaker circle {
	fill: white;
	stroke: rgb(247, 173, 67);
	stroke-width: 3px;
}
.badge-speaker svg path {
	fill: rgb(247, 173, 67);
}

.badge-accessibility circle {
	fill: rgba(17, 121, 157, 0.25);
}
.badge-accessibility-contributor circle {
	fill: white;
}
.badge-accessibility circle,
.badge-accessibility-contributor circle {
	stroke: rgb(17, 121, 157);
	stroke-width: 3px;
}
.badge-accessibility svg path,
.badge-accessibility-contributor svg path {
	fill: rgb(17, 121, 157);
}

.badge-documentation circle {
	fill: rgba(59, 114, 54, 0.25);
}
.badge-documentation-contributor circle {
	fill: white;
}
.badge-documentation circle,
.badge-documentation-contributor circle {
	stroke: rgb(59, 114, 54);
	stroke-width: 3px;
}
.badge-documentation svg path,
.badge-documentation-contributor svg path {
	fill: rgb(59, 114, 54);
}

.badge-mobile circle {
	fill: rgba(251, 161, 108, 0.25);
	stroke: rgb(251, 161, 108);
	stroke-width: 3px;
}
.badge-mobile svg path {
	fill: rgb(251, 161, 108);
}

.badge-training circle {
	fill: rgba(233, 192, 45, 0.25);
}
.badge-training-contributor circle {
	fill: white;
}
.badge-training circle,
.badge-training-contributor circle {
	stroke: rgb(233, 192, 45);
	stroke-width: 3px;
}
.badge-training svg path,
.badge-training-contributor svg path {
	fill: rgb(233, 192, 45);
}

.badge-translation-editor circle {
	fill: rgba(195, 34, 131, 0.25);
}
.badge-translation-contributor circle {
	fill: white;
}
.badge-translation-editor circle,
.badge-translation-contributor circle {
	stroke: rgb(195, 34, 131);
	stroke-width: 3px;
}
.badge-translation-editor svg path,
.badge-translation-contributor svg path {
	fill: rgb(195, 34, 131);
}

.badge-design circle {
	fill: rgba(238, 194, 106, 0.25);
}
.badge-design-contributor circle {
	fill: white;
}
.badge-design circle,
.badge-design-contributor circle {
	stroke: rgb(238, 194, 106);
	stroke-width: 3px;
}
.badge-design svg path,
.badge-design-contributor svg path {
	fill: rgb(238, 194, 106);
}

.badge-marketing circle {
	fill: rgba(71, 190, 167, 0.25);
}
.badge-marketing-contributor circle {
	fill: white;
}
.badge-marketing circle,
.badge-marketing-contributor circle {
	stroke: rgb(71, 190, 167);
	stroke-width: 3px;
}
.badge-marketing svg path,
.badge-marketing-contributor svg path {
	fill: rgb(71, 190, 167);
}

.badge-wp-cli circle {
	fill: rgba(66, 66, 66, 0.25);
}
.badge-wp-cli-contributor circle {
	fill: white;
}
.badge-wp-cli circle,
.badge-wp-cli-contributor circle {
	stroke: rgb(66, 66, 66);
	stroke-width: 3px;
}
.badge-wp-cli svg path,
.badge-wp-cli-contributor svg path {
	fill: rgb(66, 66, 66);
}

.badge-hosting circle {
	fill: rgba(83, 88, 166, 0.25);
}
.badge-hosting-contributor circle {
	fill: white;
}
.badge-hosting circle,
.badge-hosting-contributor circle {
	stroke: rgb(83, 88, 166);
	stroke-width: 3px;
}
.badge-hosting svg path,
.badge-hosting-contributor svg path {
	fill: rgb(83, 88, 166);
}

.badge-tide circle {
	fill: rgba(21, 38, 255, 0.25);
}
.badge-tide-contributor circle {
	fill: white;
}
.badge-tide circle,
.badge-tide-contributor circle {
	stroke: rgb(21, 38, 255);
	stroke-width: 3px;
}
.badge-tide svg path,
.badge-tide-contributor svg path {
	fill: rgb(21, 38, 255);
}

.badge-security-team {
	fill: rgba(0, 204, 58, 0.25);
}
.badge-security-contributor circle {
	fill: unset;
}
.badge-security-team,
.badge-security-contributor circle {
	stroke: rgb(0, 204, 58);
	stroke-width: 3px;
}
.badge-security-team svg path,
.badge-security-contributor svg path {
	fill: rgb(0, 204, 58);
}

.badge-bbpress circle {
	fill: rgba(45, 142, 66, 0.25);;
}
.badge-bbpress-contributor circle {
	fill: white;
}
.badge-bbpress circle,
.badge-bbpress-contributor circle {
	stroke: rgb(45, 142, 66);
	stroke-width: 3px;
}
.badge-bbpress svg path,
.badge-bbpress-contributor svg path {
	fill: rgb(45, 142, 66);
}

.badge-buddypress circle, 
.badge-buddypress-contributor circle {
	fill: white;
	stroke: rgb(216, 72, 0);
	stroke-width: 3px;
}

.badge-buddypress svg path, 
.badge-buddypress-contributor svg path {
	fill: rgb(216, 72, 0);
}

.badge-test circle {
	fill: rgba(0, 128, 128, 0.25);
}
.badge-test-contributor circle {
	fill: white;
}
.badge-test circle,
.badge-test-contributor circle {
	stroke: rgb(0, 128, 128);
	stroke-width: 3px;
}
.badge-test svg path,
.badge-test-contributor svg path {
	fill: rgb(0, 128, 128);
}

.badge-openverse circle {
	fill: rgba(197, 43, 155, 0.25);
}
.badge-openverse-contributor circle {
	fill: white;
}
.badge-openverse circle,
.badge-openverse-contributor circle {
	stroke: rgb(197, 43, 155);
	stroke-width: 3px;
}
.badge-openverse svg path,
.badge-openverse-contributor svg path {
	fill: rgb(197, 43, 155);
}

.badge-patterns-team,
.badge-pattern-author circle {
	fill: rgba(146, 75, 179, 0.25);
	stroke: rgb(146, 75, 179);
	stroke-width: 3px;
}
.badge-pattern-author circle {
	fill: white;
}
.badge-patterns-team svg path,
.badge-pattern-author svg path {
	fill: rgb(146, 75, 179);
}

.badge-photos-team circle,
.badge-photo-contributor circle {
	fill: rgba(59, 114, 54, 0.25);
	stroke: rgb(59, 114, 54);
	stroke-width: 3px;
}
.badge-photo-contributor circle {
	fill: white;
}
.badge-photos-team svg path,
.badge-photo-contributor svg path {
	fill: rgb(59, 114, 54);
}

.badge-performance-team circle {
	fill: rgba(0, 115, 170, 0.25);
}
.badge-performance-contributor circle {
	fill: white;
}
.badge-performance-team circle,
.badge-performance-contributor circle {
	stroke: rgb(0, 115, 170);
	stroke-width: 3px;
}
.badge-performance-team svg path,
.badge-performance-contributor svg path {
	fill: rgb(0, 115, 170);
}
]]>
</style>

	${('true' === linkProfile) ? `<a xlink:href="https://profiles.wordpress.org/${username}/" target="_blank" xmlns:xlink="http://www.w3.org/1999/xlink">` : ''}
	<rect class="card-box" x="0" y="0" rx="4.5" height="99%" stroke="#e4e2e2" width="99%" stroke-opacity="1" />
    ${('true' === displayHeader) ? `<g xmlns="http://www.w3.org/2000/svg" class="card-title" transform="translate(25, 35)">
        ${('true' === displayAvatar) ? `<g transform="translate(0, -15)">
			<svg width="100" height="100">
				<circle cx="50" cy="50" r="50%" stroke="#e4e2e2" fill="#ffffff" stroke-opacity="1" />
				<text x="26" y="63" class="initials">${initials}</text>
				<image x="0" y="0" href="${avatar64}" height="100" width="100" style="clip-path: inset(2px 2px round 50%);" stroke="#e4e2e2" stroke-opacity="1" />
			</svg>
        </g>` : ''}
        <g transform="translate(${('true' === displayAvatar) ? '110, 5' : '0, 5'})">
    		<text x="0" y="0">
				<tspan x="0" y="0" class="subtitle">WordPress Activity</tspan>	
				<tspan x="0" y="25" class="name">${name}</tspan>
				<tspan x="0" y="45" class="subheader">User: @${username}</tspan>
				<tspan x="0" y="65" class="subheader">Member Since: ${membersince}</tspan>
			</text>
        </g>
    </g>` : ''}
    <g class="badges" transform="translate(0, ${('true' === displayHeader) ? '140' : '25'})">
        <svg viewBox="0 0 430 400" width="430" height="400" overflow="visible" class="row">
            ${badges}
        </svg>
    </g>
	${('true' === linkProfile) ? `</a>` : ''}
	</svg>`;

return htmlResult;
}

/**
 * 
 * @param {Badges HTML element} badges
 * @param {displayBadges} display or not the badges
 * @returns HTML list code with the badges and labels.
 */
async function renderBadgesSVG(badges, displayBadges) {
    let htmlResult      = '';
    let elementPostionY = 2;
    let itemCount       = 0;

    badges.forEach(element => {
        let elementPostionX = (itemCount % 2 == 0) ? 0 : 250;
        var iconClass = element.class;
        var badgeName = element.name;

        // Remove "has-overlay" from the class name if it exists.
        iconClass = iconClass.replace('has-overlay', '').trim();

        badgeClass = iconClass.substring(iconClass.lastIndexOf("badge"), iconClass.lastIndexOf(" ")).replace(' ', '-');
        dashClass = iconClass.substring(iconClass.lastIndexOf("dashicons"), iconClass.length).replace(' ', '-');
        const iconPath = `./public/images/svg/${dashClass}.svg`;

        htmlResult += `
        <g transform="translate(${elementPostionX}, ${elementPostionY})" class="col">
            <g class="achievement" style="animation-delay: 450ms" transform="translate(25, 0)">
                <svg viewBox="0 0 24 24" width="24" height="24" overflow="visible" class="${iconClass}">
                    <circle cx="12" cy="12" r="50%" />
                    <g transform="scale(0.65)" style="transform-origin: center;">
                        ${fs.readFileSync(iconPath, { encoding: 'utf8', flag: 'r' })}
                    </g>
                </svg>
                <text class="label  bold" x="35" y="17">${badgeName}</text>
            </g>
        </g>`;

        elementPostionY += (itemCount % 2 != 0) ? 30 : 0 ;
        itemCount += 1;
    });
    return ('true' === displayBadges) ? htmlResult : '';
}

module.exports = { renderBadgesSVG, renderCard };
