$(function() {

    var dom = require("ace/lib/dom");

    var editor = ace.edit("editor1");
    editor.setTheme("ace/theme/dracula");
    editor.session.setMode("ace/mode/abap");
    editor.renderer.setScrollMargin(10, 10);
    editor.setOptions({
      autoScrollEditorIntoView: true,
      enableMultiselect: true,
      fadeFoldWidgets: true,
      useSoftTabs: true,
      tabSize: 2,
      enableBasicAutocompletion: true,
      enableSnippets: true,
      wrap: true,
      maxLines: 30,
      minLines: 2
    });

    var count = 1;
    function add() {

      var oldEl = $(".ace_editor").eq($(".ace_editor").length - 1).attr("id")
      oldEl = ace.edit(oldEl).container

      count++
      var el = document.createElement("div")
      el.setAttribute("id", "editor" + count)

      oldEl.parentNode.insertBefore(el, oldEl.nextSibling)

      editor = ace.edit(el)
      editor.renderer.setScrollMargin(10, 10);
      editor.setOptions({
        mode: $("#language option:selected").val(),
        theme: "ace/theme/dracula",
        autoScrollEditorIntoView: true,
        enableMultiselect: true,
        fadeFoldWidgets: true,
        useSoftTabs: true,
        tabSize: 2,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        wrap: true,
        maxLines: 30,
        minLines: 2
      })

      var btn = document.createElement("div")
      btn.innerHTML = '<a href="#" data-editor="' + count + '" class="btn btn-danger btn-sm btn-remove" title="Remove this one!"><i class="fas fa-trash"></i></a>';

      editor.container.appendChild(btn)
      scroll()

    }

    function scroll(speed) {
      var top = editor.container.getBoundingClientRect().top
      speed = speed || 10
      if (top > 60 && speed < 500) {
        if (speed > top - speed - 50)
          speed = top - speed - 50
        else
          setTimeout(scroll, 10, speed + 10)
        window.scrollBy(0, speed)
      }
    }

    var themes = require("ace/ext/themelist").themes.map(function(t){return t.theme});

    window.add = add;
    window.scroll = scroll;

    $("#new").click(function() {
      if (confirm("Are you sure you want to start a new project? You may lost the unsaved data!")) {
        location.reload();
      }
    });

    $("#import").click(function() {
      $("#file").trigger("click");
    });

    String.prototype.replaceAll = function(search, replacement) {
      var target = this;
      return target.split(search).join(replacement);
    };

    $("#file").on("change", function(evt) {
      var $content = $("#content");
      // remove content
      $content.html("");

      // Closure to capture the file information.
      function handleFile(f) {
        var i = 1;
        JSZip.loadAsync(f)                                   // 1) read the Blob
        .then(function(zip) {
          zip.forEach(function (relativePath, zipEntry) {  // 2) print entries

            var fileName = f.name;
            fileName = fileName.replace(".zip", "");
            fileName = fileName.split("-");

            var mode = "ace/mode/javascript";
            if (fileName.length ==  2) {
              $("#name").val(fileName[0]);
              mode = fileName[1].replaceAll("_", "/");
              console.log(mode);
              $("#language").val(mode);
            }
            console.log(fileName);
            Promise.all([
              zip.file(zipEntry.name).async("text")
            ]).then(function(result) {
              var text = result[0]; // text

              if (i == 1) {

                var content = document.getElementById("content")
                
                var el = document.createElement("div")
                el.setAttribute("id", "editor" + i)
                content.appendChild(el)

                editor = ace.edit(el)
                editor.renderer.setScrollMargin(10, 10);
                editor.setOptions({
                  mode: mode,
                  theme: "ace/theme/dracula",
                  autoScrollEditorIntoView: true,
                  enableMultiselect: true,
                  fadeFoldWidgets: true,
                  useSoftTabs: true,
                  tabSize: 2,
                  enableBasicAutocompletion: true,
                  enableSnippets: true,
                  wrap: true,
                  maxLines: 30,
                  minLines: 2
                })

                editor.setValue([
                  text
                ].join(""), -1)

              } else {

                var oldEl = $(".ace_editor").eq($(".ace_editor").length - 1).attr("id")
                oldEl = ace.edit(oldEl).container
                
                var el = document.createElement("div")
                el.setAttribute("id", "editor" + i)
                oldEl.parentNode.insertBefore(el, oldEl.nextSibling)

                editor = ace.edit(el)
                editor.renderer.setScrollMargin(10, 10);
                editor.setOptions({
                  mode: mode,
                  theme: "ace/theme/dracula",
                  autoScrollEditorIntoView: true,
                  enableMultiselect: true,
                  fadeFoldWidgets: true,
                  useSoftTabs: true,
                  tabSize: 2,
                  enableBasicAutocompletion: true,
                  enableSnippets: true,
                  wrap: true,
                  maxLines: 30,
                  minLines: 2
                })

                editor.setValue([
                  text
                ].join(""), -1)

                var btn = document.createElement("div")
                btn.innerHTML = '<a href="#" data-editor="' + count + '" class="btn btn-danger btn-sm btn-remove" title="Remove this one!"><i class="fas fa-trash"></i></a>';

                editor.container.appendChild(btn)

              }

              i++;

            });

            console.log(zipEntry.name);
          });
          console.log(zip);
        }, function (e) {
          console.log("Error reading " + f.name + ": " + e.message)
        });
      }

      var files = evt.target.files;
      for (var i = 0; i < files.length; i++) {
        handleFile(files[i]);
      }
    });

    $("#save").click(function() {

      var $editors = $(".ace_editor");
      var projectOrFileName = $("#name").val();
      var language = $("#language").val();
      var zip = new JSZip();

      for (var i = 0; i < $editors.length; i++) {

        editorToSave = ace.edit($editors.eq(i).attr("id"));
        zip.file($editors.eq(i).attr("id") + ".txt", editorToSave.getValue());

        if (i == ($editors.length - 1)) {
          zip.generateAsync({type:"blob"})
          .then(function(content) {
              saveAs(content, projectOrFileName + "-" + language + ".zip");
          });
        }

      }

    });

    $(document).on("click", "a.btn-remove", function() {
      var $editor = $(this).data("editor");
      editorToRemove = ace.edit("editor" + $editor);
      editorToRemove.container.remove()
    });

    $("#language").change(function() {
      var valor = $(this).val();
      var $editors = $(".ace_editor");
      for (var i = 0; i < $editors.length; i++) {
        var e = ace.edit("editor" + (i + 1));
        e.session.setMode(valor);
      }
    });

    $("body").on("keydown", function(e) {

      if (e.keyCode == 82 && e.ctrlKey || e.keyCode == 116) { //Ctrl + R and F5
        if (!confirm("Are you sure you want to update this page? You may lost the unsaved data!")) {
          if (e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }

    });

  });