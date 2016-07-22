/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/

(function (scope) {

	scope.ViewContainer = Polymer({
		is: "strand-view-container",

		behaviors: [
			StrandTraits.Refable
		],

		properties: {
			subheader: {
				type: String,
				// observer: '_updateSubHeader'
			},
			header: {
				type: String,
				// observer: '_updateHeader'
			},
			
		},

		
	});

})(window.Strand = window.Strand || {});