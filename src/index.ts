const html = String.raw

const rootStyle = [
  "border: 0",
  "clip: rect(0 0 0 0)",
  "height: 1px",
  "margin: -1px",
  "overflow: hidden",
  "padding: 0",
  "position: absolute",
  "width: 1px",

  // https://medium.com/@jessebeach/beware-smushed-off-screen-accessible-text-5952a4c2cbfe
  "white-space: nowrap",
  "word-wrap: normal",
].join(';')

export class RouteAnnouncer extends HTMLElement {
  static readonly tagName = 'route-announcer'

  shadowRoot!: ShadowRoot

  previousURL?: URL

  get currentURL() {
    return new URL(location.href)
  }

  get announcement(): string {
    if (document.title) {
      return document.title
    }

    const pageHeader = document.querySelector('h1')
    const heading = pageHeader?.innerText ?? pageHeader?.textContent ?? undefined

    return heading ?? this.currentURL.toString()
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.announce()
    window.addEventListener('popstate', this.onPopState)
  }

  disconnectedCallback() {
    window.removeEventListener('popstate', this.onPopState)
  }

  onPopState = () => {
    const currentURL = this.currentURL
    if (this.previousURL?.toString() === currentURL.toString()) {
      return
    }

    this.announce()
    this.previousURL = currentURL
  }

  announce() {
    this.shadowRoot.innerHTML = html`
      <p
        aria-live="assertive"
        id="__route-announcer__"
        role="alert"
        style="${rootStyle}"
      >
        ${this.announcement}
      </p>
    `
  }
}
