window.ImagesResolver = (function () {
  class ImagesResolver {
    constructor(config) {
      this.config = config;
      this.sources = {
        local: this.localSearch.bind(this),
        pixabay: this.pixabaySearch.bind(this),
      }
    }

    search(query, searchModuleId, signal) {
      if (!query) {
        return Promise.resolve({
          query,
          images: []
        });
      }

      const searchFunk = this.sources[searchModuleId];

      if (!searchFunk) {
        throw new Error(`Unknown search module id: ${searchModuleId}`)
      }

      return Promise.resolve(searchFunk(query, signal)).then((images) => ({
        query,
        images
      }));
    }

    localSearch(query) {
      return this.digestImages(window.localDB
        .filter((item) => item.tags.split(',').some((tag) => tag.trim().toLowerCase() === query.trim().toLowerCase())))
    }

    pixabaySearch (query, signal) {
      const { apiKey, limit } = this.config.pixabay
      const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=all&per_page=${limit}`
      return fetch(url, { signal })
          .then((res) => res.json())
          .then(({ hits }) => this.digestImages(hits))
    }

    digestImages (images) {
      return images.map(({ id, previewURL: url, tags }) => ({ id, url, tags }));
    }
  }

  return ImagesResolver;
})();