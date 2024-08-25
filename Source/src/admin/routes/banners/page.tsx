import React, { useState, useEffect } from "react";
import { RouteConfig } from "@medusajs/admin";
import { Input, Label, Container, Button } from "@medusajs/ui";
import { Url } from "url";
import { Box } from "@mui/material";
import { RouteProps } from "@medusajs/admin";
import { StoreIcon } from "../../components/icons";
//#PRODUCTION
const MEDUSA_ADMIN_BACKEND_URL =
  process.env.MEDUSA_ADMIN_BACKEND_URL || "https://2k3.ventruetechnologies.com";
//#DEVELOPMENT
// const MEDUSA_ADMIN_BACKEND_URL = "http://localhost:9025";
const CustomPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [reload, setreload] = useState<boolean | null>(null);
  const [fileList, setFileList] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  function handleChange(event) {
    console.log("File:->", event.target.files[0]);
    setFile(event.target.files[0] as File);
  }
  async function handleSubmit(e: any) {
    setLoading(true);
    e.preventDefault();

    var dd = new FormData();
    if (file !== null && file !== undefined) {
      dd.append("file", file);
      console.log("Data form file:", dd.get("file"));
      try {
        const res = await fetch(
          `${MEDUSA_ADMIN_BACKEND_URL}/admin/uploadBanner`,
          {
            method: "POST",
            credentials: "include",
            body: dd,
          }
        );

        if (res.status === 200) {
          console.log(res);
          getFileList();
        } else {
          console.log(res);
          setFile(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("err en handle submit", error);
      }
    }
  }
  // const myImage = cloudImage.image("cld-sample-5");
  async function getFileList() {
    try {
      const res = await fetch(`${MEDUSA_ADMIN_BACKEND_URL}/admin/bannerList`, {
        method: "GET",
        credentials: "include",
      });
      if (res.status === 200) {
        const rJ = await res.json();
        console.log("====================================");
        console.log(rJ);
        console.log("====================================");
        setFileList(rJ.fileList);
      } else {
        console.log("Response:", res);
      }
    } catch (error) {
      console.error("ERROR en getFileList", error);
    }
  }
  async function handleDelete(img: string) {
    try {
      const url = new URL("/admin/bannerList", MEDUSA_ADMIN_BACKEND_URL);
      url.searchParams.append("image", img);
      const res = await fetch(url.toString(), {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 200) {
        setreload(true);
      } else {
        console.log("Response:", res);
      }
    } catch (error) {
      console.error("ERROR en getFileList", error);
    }
  }

  useEffect(() => {
    if (fileList === null) {
      getFileList();
    } else {
      setTimeout(() => {
        getFileList();
      }, 350000);
    }
    if (reload) {
      getFileList();
    }
    return () => {
      setreload(false);
    };
  }, [file, reload]);

  return (
    <Container
      style={{
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "column",
        alignContent: "center",
        justifyContent: "space-evenly",
      }}
    >
      <form
        className="container"
        onSubmit={(e) => handleSubmit(e)}
        style={{
          display: "flex",
          flexWrap: "wrap",
          flexDirection: "column",
          alignContent: "center",
          justifyContent: "center",
          margin: 1,
          padding: 1,
        }}
      >
        <Label
          htmlFor="upload-file"
          style={{ fontFamily: "Inter" }}
        >
          Subir Banner Publicitario
        </Label>
        <Container
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <Input
            id="upload-file"
            className="inputUpload"
            type="file"
            accept="image/*"
            multiple={false}
            lang="es-ES"
            onChange={handleChange}
            style={{
              margin: 0.5,
              padding: 0.5,
              fontFamily: "Inter",
            }}
          />

          <Button
            type="submit"
            disabled={loading}
          >
            Subir
          </Button>
        </Container>
      </form>
      {/* ############################################################################################## */}
      <Container style={{ marginTop: 8 }}>
        Lista de Banners cargados
        {/* <AdvancedImage cldImg={myImage} /> */}
        <div className="lista-productos">
          {fileList !== null
            ? fileList.map((imagen, index) => {
                return (
                  <Box
                    className="container flex flex-row w-full"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      width: "100%",
                      justifyContent: "space-between",
                      alignItems: "center",
                      justifyItems: "center",
                      margin: 5,
                      padding: 5,
                      maxHeight: 350,
                    }}
                  >
                    <img
                      src={`${MEDUSA_ADMIN_BACKEND_URL}/uploads/banners/${imagen}`}
                      width={150}
                      height={150}
                      key={index}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        handleDelete(imagen);
                      }}
                    >
                      Borrar
                    </Button>
                  </Box>
                );
              })
            : "No Existen Banners cargados"}
        </div>
      </Container>
    </Container>
  );
};

export const config: RouteConfig = {
  link: {
    label: "Banners Promocionales",
    icon: StoreIcon,
  },
};

export default CustomPage;
