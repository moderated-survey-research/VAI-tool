from urllib.parse import urljoin, urlencode


class URLUtil:
    @staticmethod
    def construct_url(base_url: str, path: str, params: dict | None = None) -> str:
        full_url = urljoin(base_url.rstrip("/"), path.lstrip("/"))

        if params:
            query_string = urlencode(params)
            full_url = f"{full_url}?{query_string}"

        return full_url
