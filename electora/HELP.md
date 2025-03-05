# How to write canvas custom elements

## Ref

- [Pizzeria observability on Grafana Canvas panel](https://volkovlabs.io/blog/pizzeria-canvas-20230723/)
- [Grafana Developer Guide](https://github.com/grafana/grafana/blob/main/contribute/developer-guide.md)

## Build and run

1. On Windows use WSL only
2. Check prerequisites

   ```shell
   git version
   # sudo apt install git -y
   
   go version
   # sudo apt install golang-go
   
   node --version
   npm --version
   # sudo apt install nodejs npm
   
   gcc --version
   # sudo apt install build-essential
   
   yarn --version
   # sudo apt install --no-install-recommends yarn
   ```
   
3. Clone repo

   ```shell
   git clone https://github.com/grafana/grafana.git
   # make lefthook-install
   # make lefthook-uninstall
   ```

4. Build and run frontend

   ```shell
   cd grafana
   yarn install --immutable
   yarn start
   ```

5. Build and run backend

   ```shell
   make run
   ```

6. Navigating to `http://localhost:3000` and login as `admin`/`admin`

## Add canvas custom elements and create patch
   
1. Add new `tsx` components to `public/app/features/canvas/elements/`
2. Register component id's in `public/app/features/canvas/registry.ts`
3. Add component id's to `SVGElements` in `public/app/features/canvas/runtime/elements.tsx`
4. Check git status

   ```shell
   ~/grafana (feature/canvas-custom-elements*) $ git status
   On branch feature/canvas-custom-elements
   Changes to be committed:
     (use "git restore --staged <file>..." to unstage)
           new file:   public/app/features/canvas/elements/electora/achtelrund.tsx
           new file:   public/app/features/canvas/elements/electora/halbrund.tsx
           new file:   public/app/features/canvas/elements/electora/viertelrund.tsx
           new file:   public/app/features/canvas/elements/electora/waagerecht.tsx
           new file:   public/app/features/canvas/elements/electora/weiche.tsx
           modified:   public/app/features/canvas/registry.ts
           modified:   public/app/features/canvas/runtime/element.tsx
   ```

5. Commit changes

   ```shell
   git commit -m "Electora canvas custom elements"
   ```
   
6. Create patch for last commit

   ```shell
   git format-patch -1
   ```

7. Check patch

   ```shell
   git apply --check 0001-Electora-canvas-custom-elements.patch
   ```

## Apply patch

1. Checkout specific grafana version

   ```shell
   git checkout tags/v11.5.2 -b feature/apply-electora-patch
   ```

2. Check patch before apply

   ```shell
   git apply --check 0001-Electora-canvas-custom-elements.patch
   ```
   
3. Apply patch

   ```shell
   git apply --check 0001-Electora-canvas-custom-elements.patch
   ```

4. Check git status

   ```shell
   ~/grafana (feature/apply-electora-patch*) $ git status
   On branch feature/apply-electora-patch
   Changes not staged for commit:
   (use "git add <file>..." to update what will be committed)
   (use "git restore <file>..." to discard changes in working directory)
   modified:   public/app/features/canvas/registry.ts
   modified:   public/app/features/canvas/runtime/element.tsx
   
   Untracked files:
   (use "git add <file>..." to include in what will be committed)
   public/app/features/canvas/elements/electora/
   
   no changes added to commit (use "git add" and/or "git commit -a")
   ```
5. Test patch

## Build custom docker image

1. Create `Electora.dockerfile` in `packaging/docker/custom/`

   ```Dockerfile
   ARG GRAFANA_VERSION
   
   FROM grafana/grafana:${GRAFANA_VERSION}
   
   COPY 0001-Electora-canvas-custom-elements.patch /tmp
   
   USER root
   
   RUN \
     apk add --no-cache git && \
     git apply /tmp/0001-Electora-canvas-custom-elements.patch && \
     apk del git
   
   USER grafana
   ```

2. Build image

   ```shell
   docker build --build-arg "GRAFANA_VERSION=11.5.2" -t grafana-electora:11.5.2 -f packaging/docker/custom/Electora.dockerfile .
   ```

3. Run image

   ```shell
   docker run -d -p 3000:3000 --name=grafana grafana-electora:11.5.2
   ```

4. Check if patch is applied

   ```shell
   docker exec -it grafana ls -lrt public/app/features/canvas/elements/electora
   docker exec -it grafana cat public/app/features/canvas/registry.ts
   docker exec -it grafana cat public/app/features/canvas/runtime/element.tsx
   ```

   ```shell
   docker exec -it grafana bash
   ```
   
## Maintain canvas custom elements

### Eigenes Git-Repo

1. Eigenes Git-Repo zur Verwaltung der eigenen Änderungen (im `public` Ordner) zu verwalten.
2. Erstelle ein benutzerdefiniertes Dockerfile, das auf dem offiziellen Grafana-Image basiert.

   ```Dockerfile
   FROM grafana/grafana:latest
   COPY custom-files/ /usr/share/grafana/public
   ```

3. GitLab CI, um Ihr angepasstes Image automatisch zu bauen und zu aktualisieren, wenn sich entweder das offizielle
   Grafana-Image oder Ihre Anpassungen ändern.

### Git-Patch

...

###

```shell
export GRAFANA_VERSION=11.5.2
#
git clone https://github.com/grafana/grafana.git
cd grafana
#
git checkout tags/v${GRAFANA_VERSION}
#
git apply grafana-electora.patch
#
cd packaging/docker/custom
docker build \
  --build-arg "GRAFANA_VERSION=${GRAFANA_VERSION}" \
  -t grafana-electora:${GRAFANA_VERSION} .
```

###

```Dockerfile
FROM grafana/grafana:latest

COPY grafana-electora.patch /tmp/

RUN apk add --no-cache git && \
git apply /tmp/grafana-electora.patch && \
apk del git
```

```shell
docker build \
  --build-arg "GRAFANA_VERSION=${GRAFANA_VERSION}" \
-t grafana-electora -f Dockerfile
```

