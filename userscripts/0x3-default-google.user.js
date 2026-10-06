// ==UserScript==
// @name         0x3 默认 Google 搜索
// @namespace    https://github.com/ChambersXDU/0x3
// @version      1.1.0
// @description  等待 0x3 搜索框加载后，通过原站菜单切换为 Google，保留手动切换功能。
// @match        https://0x3.com/*
// @match        http://0x3.com/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

(() => {
    'use strict';

    const completed = new WeakSet();
    const busy = new WeakSet();
    const attempts = new WeakMap();
    const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

    function rememberGoogle() {
        try {
            const raw = localStorage.getItem('setting');
            const settings = raw === null ? {} : JSON.parse(raw);
            if (settings !== null && (typeof settings !== 'object' || Array.isArray(settings))) return;
            localStorage.setItem('setting', JSON.stringify({ ...settings, engine: 'google' }));
        } catch (error) {
            console.warn('[0x3 Google] 本地偏好未能保存，仍会尝试切换页面中的搜索引擎。', error);
        }
    }

    async function selectGoogle(input) {
        if (completed.has(input) || busy.has(input) || !input.isConnected) return;
        const form = input.closest('form');
        const activeIcon = form?.querySelector('img[src*="/assets/search/"]');
        if (!activeIcon) return;

        if (/\/google\.svg(?:[?#]|$)/.test(activeIcon.getAttribute('src') || '')) {
            completed.add(input);
            rememberGoogle();
            return;
        }

        const count = attempts.get(input) || 0;
        if (count >= 5) return;
        attempts.set(input, count + 1);
        busy.add(input);

        try {
            const scope = form.parentElement;
            let option = scope.querySelector('li img[src$="/google.svg"]')?.closest('li');
            if (!option) {
                activeIcon.parentElement.click();
                await pause(80);
                option = scope.querySelector('li img[src$="/google.svg"]')?.closest('li');
            }
            if (option && input.isConnected) {
                option.click();
                await pause(80);
                if (/\/google\.svg(?:[?#]|$)/.test(activeIcon.getAttribute('src') || '')) {
                    completed.add(input);
                    rememberGoogle();
                    console.info('[0x3 Google] 默认搜索已切换为 Google。');
                }
            }
        } catch (error) {
            console.warn('[0x3 Google] 搜索引擎切换未完成。', error);
        } finally {
            busy.delete(input);
            if (!completed.has(input) && input.isConnected && count < 4) {
                setTimeout(() => selectGoogle(input), 300);
            }
        }
    }

    function scan() {
        document.querySelectorAll('input[type="search"]').forEach(selectGoogle);
    }

    rememberGoogle();
    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src'],
    });
    scan();
})();
