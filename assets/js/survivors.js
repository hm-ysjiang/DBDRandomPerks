(() => {
    const LSKEY_LANG = 'dbdperkgen-lang'
    const LSKEY_VALIDPERK = 'dbdperkgen-survivor-valid_perk'
    const LSKEY_MXAMOUNT = 'dbdperkgen-survivor-max_amount'
    const LSKEY_ONEEXH = 'dbdperkgen-survivor-one_exhaust'
    const LSKEY_SPLOCK = 'dbdperkgen-survivor-sp_lock'
    const EXH_PERKS = ['sprint_burst', 'dead_hard', 'balanced_landing', 'lithe', 'head_on']

    var lang
    var teachables = {}
    var generals = {}
    var lang_map = {}
    var translation = {}
    var translation_default = {}
    var valid_perks = {}
    var max_amount = 4
    var oneexh = 0
    var splock = 0

    function preInit() {
        lang = localStorage.getItem(LSKEY_LANG)
        if (!lang) {
            localStorage.setItem(LSKEY_LANG, 'en')
            lang = 'en'
        }

        max_amount = localStorage.getItem(LSKEY_MXAMOUNT)
        if (max_amount)
            max_amount = parseInt(max_amount)
        else {
            localStorage.setItem(LSKEY_MXAMOUNT, 4)
            max_amount = 4
        }

        oneexh = localStorage.getItem(LSKEY_ONEEXH)
        if (oneexh)
            oneexh = parseInt(oneexh)
        if (!oneexh) {
            localStorage.setItem(LSKEY_ONEEXH, 0)
            oneexh = 0
        }

        splock = localStorage.getItem(LSKEY_SPLOCK)
        if (splock)
            splock = parseInt(splock)
        if (!splock) {
            localStorage.setItem(LSKEY_SPLOCK, 0)
            splock = 0
        }

        getTeachablePerks()
    }

    function getTeachablePerks() {
        fetch('/assets/perks/survivors/teachable.json').then(res => {
            res.json().then(json => {
                teachables = json
            }).then(getGeneralPerks)
        })
    }

    function getGeneralPerks() {
        fetch('/assets/perks/survivors/general.json').then(res => {
            res.json().then(json => {
                generals = json
            }).then(getLanguages)
        })
    }

    function getLanguages() {
        fetch('/assets/lang/index.json').then(res => {
            res.json().then(json => {
                lang_map = json
            }).then(() => {
                fetch('/assets/lang/' + lang + '.json').then(res => {
                    res.json().then(json => {
                        translation = json
                    }).then(() => {
                        fetch('/assets/lang/en.json').then(res => {
                            res.json().then(json => {
                                translation_default = json
                            }).then(postInit)
                        })
                    })
                })
            })
        })
    }

    function getTranslatedText(key) {
        if (!translation[key])
            return translation_default[key]
        return translation[key]
    }

    function postInit() {
        if (!localStorage.getItem(LSKEY_VALIDPERK))
            localStorage.setItem(LSKEY_VALIDPERK, "{}")
        valid_perks = JSON.parse(localStorage.getItem(LSKEY_VALIDPERK))
        for (key in teachables) {
            teachables[key].forEach(item => {
                if (!valid_perks.hasOwnProperty(item))
                    valid_perks[item] = 1
            })
        }
        generals['perks'].forEach(item => {
            if (!valid_perks.hasOwnProperty(item))
                valid_perks[item] = 1
        })
        localStorage.setItem(LSKEY_VALIDPERK, JSON.stringify(valid_perks))

        populatePerkPool()
        populateLanguage()
        updateLang()

        $('#btn-rand').click(evt => {
            let perks = []
            for (let i = 0; i < generals['perks'].length; i++) {
                if (valid_perks[generals['perks'][i]]) {
                    perks.push(generals['perks'][i])
                }
            }
            for (key in teachables) {
                for (let i = 0; i < teachables[key].length; i++) {
                    if (valid_perks[teachables[key][i]]) {
                        perks.push(teachables[key][i])
                    }
                }
            }
            for (let i = 1; i <= 4; i++)
                $('.perk-slot.slot' + i).empty()
            selectPerks(Math.min(perks.length, max_amount), perks)
        })
        $(() => {
            $('[data-toggle="tooltip"]').tooltip()
        })
        $('#perk-decr').click(evt => {
            if (max_amount > 1) {
                max_amount--;
                localStorage.setItem(LSKEY_MXAMOUNT, max_amount)
                $('#perk-amount-text').text(max_amount)
            }
        })
        $('#perk-incr').click(evt => {
            if (max_amount < 4) {
                max_amount++;
                localStorage.setItem(LSKEY_MXAMOUNT, max_amount)
                $('#perk-amount-text').text(max_amount)
            }
        })
        $('#one-exh').change(evt => {
            if ($(evt.target).prop('checked')) {
                oneexh = 1
            }
            else {
                oneexh = 0
            }
            localStorage.setItem(LSKEY_ONEEXH, oneexh)
        })
        $('#splock').change(evt => {
            if ($(evt.target).prop('checked')) {
                splock = 1
            }
            else {
                splock = 0
            }
            localStorage.setItem(LSKEY_SPLOCK, splock)
        })
        $('#perk-amount-text').text(max_amount)
        $('#one-exh').bootstrapToggle(oneexh ? 'on' : 'off', true)
        $('#splock').bootstrapToggle(splock ? 'on' : 'off', true)
        $('#btn-clearsetting').click(evt => {
            localStorage.clear()
            location.reload()
        })
    }

    function selectPerks(amount, perks) {
        let exh_slot = Math.floor(Math.random() * 4) + 1
        let exh_flg = false
        let sp = false
        for (let i = 1; i <= amount; i++) {
            if (oneexh && !exh_flg && (i === exh_slot)) {
                let exh = Math.floor(Math.random() * 5)
                if (splock && EXH_PERKS[exh] == 'sprint_burst') {
                    sp = true
                }
                let img = $('<img>')
                img.attr('src', '/assets/icons/survivors/' + EXH_PERKS[exh] + '.png')
                img.attr('data-toggle', "tooltip")
                img.attr('data-placement', "top")
                img.attr('title', getTranslatedText(EXH_PERKS[exh]))
                $('.perk-slot.slot' + i).append(img)
                perks.splice(perks.indexOf(EXH_PERKS[exh]), 1)
                exh_flg = true
                continue
            }
            let rnd = Math.floor(Math.random() * perks.length)
            if (splock) {
                if (perks[rnd] == 'sprint_burst') {
                    if (exh_flg) {
                        i--
                        continue
                    }
                    else
                        sp = true
                }
                if (sp && EXH_PERKS.indexOf(perks[rnd]) >= 0) {
                    i--
                    continue
                }
            }
            let img = $('<img>')
            img.attr('src', '/assets/icons/survivors/' + perks[rnd] + '.png')
            img.attr('data-toggle', "tooltip")
            img.attr('data-placement', "top")
            img.attr('title', getTranslatedText(perks[rnd]))
            $('.perk-slot.slot' + i).append(img)
            if (EXH_PERKS.indexOf(perks[rnd]) >= 0)
                exh_flg = true
            perks.splice(rnd, 1)
        }
        $(() => {
            $('[data-toggle="tooltip"]').tooltip()
        })
    }

    function updateLocalValidPerks() {
        localStorage.setItem(LSKEY_VALIDPERK, JSON.stringify(valid_perks))
    }

    function populatePerkPool() {
        addPerkSet('general', generals['perks'])
        for (key in teachables) {
            addPerkSet(key, teachables[key])
        }
    }

    function addPerkSet(setName, perks) {
        var perkset = $('<div/>')
        perkset.addClass('perkset')
        perkset.html('<h5 class="perkset-title">' + getTranslatedText(setName) + '</h5>')
        var perkblock = $('<div/>')
        perkblock.addClass('perkblock')
        for (let i = 0; i < perks.length; i++) {
            let img = $('<img>')
            img.addClass('perk')
            img.attr('src', '/assets/icons/survivors/' + perks[i] + '.png')
            img.attr('id', perks[i])
            img.click(evt => {
                var id = evt.target.id
                if (valid_perks[id]) {
                    valid_perks[id] = 0
                    updateLocalValidPerks()
                    $(evt.target).addClass('invalid-perk')
                }
                else {
                    valid_perks[id] = 1
                    updateLocalValidPerks()
                    $(evt.target).removeClass('invalid-perk')
                }
            })
            img.attr('data-toggle', "tooltip")
            img.attr('data-placement', "top")
            img.attr('title', getTranslatedText(perks[i]))
            if (!valid_perks[perks[i]])
                img.addClass('invalid-perk')
            perkblock.append(img)
        }
        perkset.append(perkblock)
        perkset.append($('<hr class="hr-dark perksetsplit">'))
        $('#perkpool-body').append(perkset)
    }

    function populateLanguage() {
        for (key in lang_map) {
            let lang_opt = $('<a class="nav-link"/>')
            lang_opt.text(key)
            lang_opt.attr('id', 'lang-' + lang_map[key])
            if (lang_map[key] == lang)
                lang_opt.addClass('selected-lang')
            else {
                lang_opt.addClass('abtn')
                lang_opt.click(evt => {
                    localStorage.setItem(LSKEY_LANG, evt.target.id.substr(5))
                    location.reload()
                })
            }
            lang_opt.appendTo('#lang-body')
        }
    }

    function updateLang() {
        $('.trans-survivor').text(getTranslatedText('survivor'))
        $('.trans-killer').text(getTranslatedText('killer'))
        $('.trans-settings').text(getTranslatedText('settings'))
        $('.trans-perkpool').text(getTranslatedText('perkpool'))
        $('.trans-lang').text(getTranslatedText('lang'))
        $('.trans-misc').text(getTranslatedText('misc'))
        $('#btn-rand').text(getTranslatedText('btn-rand'))
        $('.trans-close').text(getTranslatedText('close'))
        $('.trans-langpick').text(getTranslatedText('langpick'))
        $('.trans-perks-amount').text(getTranslatedText('perks-amount'))
        $('.trans-oneexh').text(getTranslatedText('oneexh'))
        $('.trans-splock').text(getTranslatedText('splock'))
        $('.trans-splock-sub').text(getTranslatedText('splock-sub'))
        $('.trans-clearsetting').text(getTranslatedText('clearsetting'))
        $('.trans-clearsetting-btn').text(getTranslatedText('clearsetting-btn'))
    }

    preInit()
})()