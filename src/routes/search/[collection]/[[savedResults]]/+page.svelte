<script lang="ts">
    import Navbar from '$lib/components/Navbar.svelte';
    import SearchForm from '$lib/components/SearchForm.svelte';
    import SearchResultList from '$lib/components/SearchResultList.svelte';
    import { t, themeColors } from '$lib/data/stores';
    import { gotoRoute } from '$lib/navigate';
    import type { SearchResult } from '$lib/search/domain/entities';
    import type {
        SearchPresenter,
        UserSearchOptions
    } from '$lib/search/domain/interfaces/presentation-interfaces';
    import { makeSearchSession } from '$lib/search/factories';
    import type { SearchFormSubmitEvent } from '$lib/types';
    import { onMount } from 'svelte';

    let { data } = $props();

    let phrase: string = $state();
    let wholeWords: boolean = $state();
    let matchAccents: boolean = $state();

    let results: SearchResult[] = $state([]);
    let queryId = $state(0);
    let queryDone = $state(true);
    let restoreResults = $state(false); // Whether saved results are currently being loaded

    let scrollDiv: HTMLDivElement;
    let scrollPosition = 0;
    let scrollSaved = false;

    const presenter: SearchPresenter = {
        setOptions: function (newPhrase: string, options: UserSearchOptions): void {
            phrase = newPhrase;
            wholeWords = options.wholeWords;
            matchAccents = options.matchAccents;
        },
        onResults: function (newResults: SearchResult[]): void {
            results = results.concat(newResults);
        },
        onNewQuery: function (): void {
            results = [];
            queryDone = false;
        },

        onQueryDone: function (): void {
            queryDone = true;
        }
    };

    const session = makeSearchSession(presenter);

    function handleSubmit(event: SearchFormSubmitEvent) {
        gotoRoute(`/search/${data.collection}/saved`);
        queryId++;
        const options = {
            collection: data.collection,
            wholeWords: event.wholeWords,
            matchAccents: event.matchAccents
        };
        session.submit(event.phrase, options);
    }

    /**
     * Save the current scroll position
     *
     * This allows the page to return to the same scroll position if the
     * user returns to the page with the back button
     */
    function onScroll() {
        scrollSaved = false;
        scrollPosition = scrollDiv.scrollTop;

        // Wait for the scrolling to pause before saving
        const pos = scrollPosition;
        setTimeout(() => {
            if (scrollPosition === pos && !scrollSaved) {
                localStorage.setItem('search-scroll-pos', scrollPosition.toString());
                scrollSaved = true;
            }
        }, 100);
    }

    async function init() {
        const useSavedResults = data.savedResults === 'saved';
        if (useSavedResults) {
            // Load saved results
            restoreResults = true;
            await session.loadLastQuery();
            restoreResults = false;

            // Return to the saved scroll position
            const position = localStorage.getItem('search-scroll-pos');
            scrollDiv.scrollTop = position ? parseInt(position, 10) : 0;
            onScroll();
        }
    }

    onMount(() => {
        init();
        return () => {
            if (!scrollSaved) {
                scrollSaved = true;
                localStorage.setItem('search-scroll-pos', scrollPosition.toString());
            }
        };
    });
</script>

<div class="grid grid-rows-[auto,1fr,auto]" style="height:100vh;height:100dvh;">
    <div class="navbar">
        <Navbar>
            {#snippet center()}
                <label for="sidebar">
                    <div class="btn btn-ghost normal-case text-xl">{$t['Search']}</div>
                </label>
            {/snippet}
        </Navbar>
    </div>

    <div class="overflow-auto" bind:this={scrollDiv} onscroll={onScroll}>
        <div class="flex justify-center">
            <SearchForm submit={handleSubmit} {phrase} {wholeWords} {matchAccents} />
        </div>

        <div class="flex justify-center px-4">
            <hr class="max-w-screen-md w-full" style:border-color={$themeColors.DividerColor} />
        </div>

        <div class="flex justify-center">
            <SearchResultList
                collection={data.collection}
                {results}
                {queryId}
                {queryDone}
                restore={restoreResults}
            />
        </div>
    </div>
</div>
