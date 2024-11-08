FROM debian:testing-slim

RUN apt-get update
RUN apt-cache depends texlive-full | grep "Depends: " | grep -v -- "-doc" | grep -v -- "-lang-" | sed 's/Depends: //' | xargs apt-get install -y --no-install-recommends
RUN apt-get install -y --no-install-recommends texlive-lang-all fontconfig inkscape pandoc python3-pygments

ADD LatexMk /etc/LatexMk

RUN useradd tex
USER tex
