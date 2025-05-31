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
 * @returns SVG code with the user profile card
 */
function renderCard(username, name, initials, membersince, avatar64, badges, dynHeight) {

	let htmlResult =  `
<svg width="500" height="${dynHeight}" viewBox="0 0 500 ${dynHeight}" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
<title property="dc:title">${name} Profile</title>
<style type="text/css" >
<![CDATA[
.name {
    font: 700 20px 'Segoe UI', Ubuntu, Sans-Serif;
    fill: #191E23;
    animation: fadeInAnim 0.8s ease-in-out forwards;
}
.subtitle {
    font: 700 14px 'Segoe UI', Ubuntu, Sans-Serif;
    fill: #191E23;
}
.subheader {
    font: 500 16px 'Segoe UI', Ubuntu, Sans-Serif;
    fill: #82878C;
    animation: fadeInAnim 0.8s ease-in-out forwards;
}
.initials {
    font: 700 40px 'Segoe UI', Ubuntu, Sans-Serif;
    fill: #191E23;
}
.achievement {
    opacity: 0;
    animation: fadeInAnim 0.3s ease-in-out forwards;
}
.label {
    font: 600 12px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif;
    fill: #23282D;
}
@keyframes fadeInAnim {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
.badge-themes-reviewer circle {
	fill: rgba(78, 50, 136, 0.25);
	stroke: rgb(78, 50, 136);
	stroke-width: 3px;
}
.badge-themes-reviewer svg path {
	fill: rgb(78, 50, 136);
}

.badge-themes circle {
	fill: white;
	stroke: rgb(78, 50, 136);
	stroke-width: 3px;
}
.badge-themes svg path {
	fill: rgb(78, 50, 136);
}

.badge-plugins-reviewer circle {
	fill: rgba(240, 103, 35, 0.25);
	stroke: rgb(240, 103, 35);
	stroke-width: 3px;
}
.badge-plugins-reviewer svg path {
	fill: rgb(240, 103, 35);
}

.badge-plugins circle {
	fill: white;
	stroke: rgb(240, 103, 35);
	stroke-width: 3px;
}
.badge-plugins svg path {
	fill: rgb(240, 103, 35);
}

.badge-community circle {
	fill: rgba(17, 121, 157, 0.25);
	stroke: rgb(17, 121, 157);
	stroke-width: 3px;
}
.badge-community svg path {
	fill: rgb(17, 121, 157);
}

.badge-community-contributor circle {
	fill: white;
	stroke: rgb(17, 121, 157);
	stroke-width: 3px;
}
.badge-community-contributor svg path {
	fill: rgb(17, 121, 157);
}

.badge-meta circle {
	fill: rgba(174, 173, 173, 0.25);
	stroke: rgb(174, 173, 173);
	stroke-width: 3px;
}
.badge-meta svg path {
	fill: rgb(174, 173, 173);
}

.badge-meta-contributor circle {
	fill: white;
	stroke: rgb(174, 173, 173);
	stroke-width: 3px;
}
.badge-meta-contributor svg path {
	fill: rgb(174, 173, 173);
}

.badge-code-committer circle {
	fill: rgba(205, 0, 0, 0.25);
	stroke: rgb(205, 0, 0);
	stroke-width: 3px;
}
.badge-code-committer svg path {
	fill: rgb(205, 0, 0);
}

.badge-code circle {
	fill: white;
	stroke: rgb(205, 0, 0);
	stroke-width: 3px;
}
.badge-code svg path {
	fill: rgb(205, 0, 0);
}

.badge-support circle {
	fill: rgba(51, 180, 206, 0.25);
	stroke: rgb(51, 180, 206);
	stroke-width: 3px;
}
.badge-support svg path {
	fill: rgb(51, 180, 206);
}

.badge-support-contributor circle {
	fill: white;
	stroke: rgb(51, 180, 206);
	stroke-width: 3px;
}
.badge-support-contributor svg path {
	fill: rgb(51, 180, 206);
}

.badge-wordpress-tv circle {
	fill: rgba(115, 173, 48, 0.25);
	stroke: rgb(115, 173, 48);
	stroke-width: 3px;
}
.badge-wordpress-tv svg path {
	fill: rgb(115, 173, 48);
}

.badge-wordpress-tv-contributor circle {
	fill: white;
	stroke: rgb(115, 173, 48);
	stroke-width: 3px;
}
.badge-wordpress-tv-contributor svg path {
	fill: rgb(115, 173, 48);
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
	stroke: rgb(17, 121, 157);
	stroke-width: 3px;
}
.badge-accessibility svg path {
	fill: rgb(17, 121, 157);
}

.badge-accessibility-contributor circle {
	fill: white;
	stroke: rgb(17, 121, 157);
	stroke-width: 3px;
}
.badge-accessibility-contributor svg path {
	fill: rgb(17, 121, 157);
}

.badge-documentation circle {
	fill: rgba(59, 114, 54, 0.25);
	stroke: rgb(59, 114, 54);
	stroke-width: 3px;
}
.badge-documentation svg path {
	fill: rgb(59, 114, 54);
}

.badge-documentation-contributor circle {
	fill: white;
	stroke: rgb(59, 114, 54);
	stroke-width: 3px;
}
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
	stroke: rgb(233, 192, 45);
	stroke-width: 3px;
}
.badge-training svg path {
	fill: rgb(233, 192, 45);
}

.badge-training-contributor circle {
	fill: white;
	stroke: rgb(233, 192, 45);
	stroke-width: 3px;
}
.badge-training-contributor svg path {
	fill: rgb(233, 192, 45);
}

.badge-translation-editor circle {
	fill: rgba(195, 34, 131, 0.25);
	stroke: rgb(195, 34, 131);
	stroke-width: 3px;
}
.badge-translation-editor svg path {
	fill: rgb(195, 34, 131);
}

.badge-translation-contributor circle {
	fill: white;
	stroke: rgb(195, 34, 131);
	stroke-width: 3px;
}
.badge-translation-contributor svg path {
	fill: rgb(195, 34, 131);
}

.badge-design circle {
	fill: rgba(238, 194, 106, 0.25);
	stroke: rgb(238, 194, 106);
	stroke-width: 3px;
}
.badge-design svg path {
	fill: rgb(238, 194, 106);
}

.badge-design-contributor circle {
	fill: white;
	stroke: rgb(238, 194, 106);
	stroke-width: 3px;
}
.badge-design-contributor svg path {
	fill: rgb(238, 194, 106);
}

.badge-marketing circle {
	fill: rgba(71, 190, 167, 0.25);
	stroke: rgb(71, 190, 167);
	stroke-width: 3px;
}
.badge-marketing svg path {
	fill: rgb(71, 190, 167);
}

.badge-marketing-contributor circle {
	fill: white;
	stroke: rgb(71, 190, 167);
	stroke-width: 3px;
}
.badge-marketing-contributor svg path {
	fill: rgb(71, 190, 167);
}

.badge-wp-cli circle {
	fill: rgba(66, 66, 66, 0.25);
	stroke: rgb(66, 66, 66);
	stroke-width: 3px;
}
.badge-wp-cli svg path {
	fill: rgb(66, 66, 66);
}

.badge-wp-cli-contributor circle {
	fill: white;
	stroke: rgb(66, 66, 66);
	stroke-width: 3px;
}
.badge-wp-cli-contributor svg path {
	fill: rgb(66, 66, 66);
}

.badge-hosting circle {
	fill: rgba(83, 88, 166, 0.25);
	stroke: rgb(83, 88, 166);
	stroke-width: 3px;
}
.badge-hosting svg path {
	fill: rgb(83, 88, 166);
}

.badge-hosting-contributor circle {
	fill: white;
	stroke: rgb(83, 88, 166);
	stroke-width: 3px;
}
.badge-hosting-contributor svg path {
	fill: rgb(83, 88, 166);
}

.badge-tide circle {
	fill: rgba(21, 38, 255, 0.25);
	stroke: rgb(21, 38, 255);
	stroke-width: 3px;
}
.badge-tide svg path {
	fill: rgb(21, 38, 255);
}

.badge-tide-contributor circle {
	fill: white;
	stroke: rgb(21, 38, 255);
	stroke-width: 3px;
}
.badge-tide-contributor svg path {
	fill: rgb(21, 38, 255);
}

.badge-security-team,
.badge-security-contributor circle {
	fill: rgba(0, 204, 58, 0.25);
	stroke: rgb(0, 204, 58);
	stroke-width: 3px;
}

.badge-security-team svg path,
.badge-security-contributor svg path {
	fill: rgb(0, 204, 58);
}

.badge-security-contributor circle {
	fill: unset;
}

.badge-bbpress circle {
	fill: rgba(45, 142, 66, 0.25);
	stroke: rgb(45, 142, 66);
	stroke-width: 3px;
}
.badge-bbpress svg path {
	fill: rgb(45, 142, 66);
}

.badge-bbpress-contributor circle {
	fill: white;
	stroke: rgb(45, 142, 66);
	stroke-width: 3px;
}
.badge-bbpress-contributor svg path {
	fill: rgb(45, 142, 66);
}

.badge-buddypress circle, .badge-buddypress-contributor circle {
	fill: white;
	stroke: rgb(216, 72, 0);
	stroke-width: 3px;
}

.badge-buddypress svg path, .badge-buddypress-contributor svg path {
	fill: rgb(216, 72, 0);
}

.badge-buddypress circle
	fill: white;
	fill: rgb(216, 72, 0, 0.25);
	stroke-width: 3px;
}

.badge-test circle {
	fill: rgba(0, 128, 128, 0.25);
	stroke: rgb(0, 128, 128);
	stroke-width: 3px;
}
.badge-test svg path {
	fill: rgb(0, 128, 128);
}

.badge-test-contributor circle {
	fill: white;
	stroke: rgb(0, 128, 128);
	stroke-width: 3px;
}
.badge-test-contributor svg path {
	fill: rgb(0, 128, 128);
}

.badge-openverse circle {
	fill: rgba(197, 43, 155, 0.25);
	stroke: rgb(197, 43, 155);
	stroke-width: 3px;
}
.badge-openverse svg path {
	fill: rgb(197, 43, 155);
}

.badge-openverse-contributor circle {
	fill: white;
	stroke: rgb(197, 43, 155);
	stroke-width: 3px;
}
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
	stroke: rgb(0, 115, 170);
	stroke-width: 3px;
}
.badge-performance-team svg path {
	fill: rgb(0, 115, 170);
}

.badge-performance-contributor circle {
	fill: white;
	stroke: rgb(0, 115, 170);
	stroke-width: 3px;
}
.badge-performance-contributor svg path {
	fill: rgb(0, 115, 170);
}
]]>
</style>
  <rect x="0" y="0" rx="4.5" height="99%" stroke="#e4e2e2" width="99%" fill="#ffffff" stroke-opacity="1" />
    <g xmlns="http://www.w3.org/2000/svg" class="card-title" transform="translate(25, 35)">
        <g transform="translate(0, -15)">
			<svg width="100" height="100">
				<circle cx="50" cy="50" r="50%" stroke="#e4e2e2" fill="#ffffff" stroke-opacity="1" />
				<text x="26" y="63" class="initials">${initials}</text>
				<image x="0" y="0" href="${avatar64}" height="100" width="100" style="clip-path: inset(2px 2px round 50%);" stroke="#e4e2e2" stroke-opacity="1" />
			</svg>
        </g>
        <g transform="translate(110, 5)">
    		<text x="0" y="0">
				<tspan x="0" y="0" class="subtitle">WordPress Activity</tspan>	
				<tspan x="0" y="25" class="name">${name}</tspan>
				<tspan x="0" y="45" class="subheader">User: @${username}</tspan>
				<tspan x="0" y="65" class="subheader">Member Since: ${membersince}</tspan>
			</text>
        </g>
    </g>
    <g class="badges" transform="translate(0, 140)">
        <svg viewBox="0 0 430 400" width="430" height="400" overflow="visible" class="row">
            ${badges}
        </svg>
    </g>
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
        let elementPostionX = (itemCount % 2 == 0) ? 0 : 210;
        var iconClass = element.class;
        var badgeName = element.name;
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