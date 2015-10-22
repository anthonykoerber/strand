/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Group = Polymer({
		is: 'mm-group',

		properties: {
			fitparent: { 
				type: String,
				reflectToAttribute: true,
				observer: '_fitparentChanged'
			},
			group: { 
				type: String,
				reflectToAttribute: true,
				observer: '_groupChanged'
			},
			align: { 
				align: 'horizontal',
				type: String,
				reflectToAttribute: true,
				observer: '_alignChanged'
			},
			value: { 
				type: Object,
				value: false,
				reflectToAttribute: true,
				observer: '_valueChanged'
			},
			_filter: {
				type: Boolean,
				value: false
			},
			_filterElementType: {
				type: String,
				value: "*"
			},
			_type: {
				type: String,
				value: false
			},
			_itemsByTagName: {
				type: Object,
				value: null
			}
		},

		HALIGN: "horizontal",
		VALIGN: "vertical",
		HALIGN_LEFT: "hgroup-left",
		HALIGN_CENTER: "hgroup-center",
		HALIGN_RIGHT: "hgroup-right",
		VALIGN_TOP: "vgroup-top",
		VALIGN_CENTER: "vgroup-center",
		VALIGN_BOTTOM: "vgroup-bottom",

		behaviors: [
			StrandTraits.Selectable
		],

		attached: function() {
			this.type = this._getType();

			this.async(function() {
				switch(this.type) {
					case "mm-button":
						this.addEventListener('click', this._updateSelectedItem);
						break;
					case "mm-radio":
						this._radioSelected(); // Check for pre-selected values
						this.addEventListener('selected', this._radioSelected);
						break;
					default:
						return;
				}
			});
		},

		detached: function() {
			console.log("detached", this);
			this.removeEventListener('click', this._updateSelectedItem);
			this.removeEventListener('selected', this._radioSelected);
		},

		ready: function() {
			// if no group ID is specified, generate a UID
			if(!this.group){
				this.group = this._createId();
			}

			if (!this.align) {
				this.align = this.HALIGN;
			}
		},

		_getType: function() {
			var type = "";
			
			// items query handled by StrandTraits.Selectable
			this._itemsByTagName = this.items.reduce(this._setType.bind(this), {});

			// infer that only one unique key means only one tag type
			var numKeys = Object.keys(this._itemsByTagName).length;

			if (numKeys === 1) {
				type = Object.keys(this._itemsByTagName)[0];
			} else {
				type = "mixed-type";
			}

			return type;
		},
		
		_setType: function(map, item) {
			var key = item.tagName.toLowerCase();
			map[key] = (map[key] || []);
			map[key].push(item);
			return map;
		},

		_updateSelectedItem: function(e) {
			var target = Polymer.dom(e).localTarget,
				targetIndex = this.items.indexOf(target);

			if (!this.multi) {
				this.selectedIndex = targetIndex;
			} else {
				this._multiselectIndex(targetIndex);
			}
		},

		_selectedIndexChanged: function(newIndex, oldIndex) {
			if (typeof newIndex === 'number') {
				var newSelected = this.items[newIndex],
					value = newSelected.value ? newSelected.value : newSelected.textContent.trim();

				if(this.value !== value) this.value = value;
				newSelected.toggleAttribute("selected");
				this._fireSelected(newSelected, newIndex);	
			}

			if (typeof oldIndex === 'number' && !this.multi) {
				this.items[oldIndex].toggleAttribute("selected");
			}
		},

		_multiselectIndex: function(newIndex) {
			var newSelected = this.items[newIndex],
				toggle = this.selectedItems.indexOf(newSelected) > -1;

			if (!toggle) {
				this.push('selectedItems', newSelected);
			} else {
				this.splice('selectedItems', this.selectedItems.indexOf(newSelected), 1);
			}

			this.value = this.selectedItems.map(function(item) {
				return item.value ? item.value : item.textContent.trim();
			});

			newSelected.toggleAttribute("selected");
			this._fireSelected(newSelected, newIndex);
		},

		_fireSelected: function(selected, index) {
			this.fire('selected', {
				item: selected,
				index: index,
				value: this.value,
				selected: true
			});
		},

		_fitparentChanged: function(newVal, oldVal) {
			this.items.forEach(this._setItemFit, this);
		},

		_setItemFit: function(item) {
			item.setAttribute("fitparent", this.fitparent);
		},

		_alignChanged: function(newVal, oldVal){
			this.items.forEach(this._setItemAlign.bind(this));
		},

		_setItemAlign: function(item, index) {
			var alignFirst	= (this.align !== this.HALIGN) ? this.VALIGN_TOP : this.HALIGN_LEFT,
				alignCenter = (this.align !== this.HALIGN) ? this.VALIGN_CENTER : this.HALIGN_CENTER,
				alignLast	= (this.align !== this.HALIGN) ? this.VALIGN_BOTTOM : this.HALIGN_RIGHT;

			// set layout on all items
			if (index === 0) {
				item.setAttribute("_layout", alignFirst);
			} else if (index === this.items.length-1) {
				item.setAttribute("_layout", alignLast);
			} else {
				item.setAttribute("_layout", alignCenter);
			}
		},

		_groupChanged: function(newVal, oldVal) {
			this.items.forEach(this._setItemGroup.bind(this));
		},

		_setItemGroup: function(item) {
			item.setAttribute("group", this.group);
		},

		_radioSelected: function(e) {
			var checked = this.items.filter(function(item) { 
				return item.hasAttribute("checked"); 
			})[0];

			if (checked) {
				this.value = checked.getAttribute("value") || checked.textContent.trim();
			}
		},

		_valueChanged: function(newVal, oldVal) {
			this.fire("changed", { value: newVal });
		},

		_createId: function() {
			var timestamp = new Date().valueOf(),
				rndNum	= Math.floor((Math.random()*99)+1),
				groupId = 'g' + rndNum + '_' + timestamp;
			return groupId;
		}

	});

})(window.Strand = window.Strand || {});